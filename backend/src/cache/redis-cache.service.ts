import { Injectable, Logger, OnModuleDestroy } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import Redis from "ioredis";

/**
 * RedisCacheService
 * - Wrapper cho Redis để dùng cache trong toàn app
 * - Dùng ioredis để kết nối
 * - Có fail-safe (không có Redis vẫn chạy bình thường)
 */
@Injectable()
export class RedisCacheService implements OnModuleDestroy {
    private readonly logger = new Logger(RedisCacheService.name);

    // client Redis (có thể null nếu không config)
    private client: Redis | null;

    constructor(private configService: ConfigService) {
        // Lấy URL Redis từ env
        const redisUrl = this.configService.get<string>('REDIS_URL');

        // Nếu không có Redis → disable cache (app vẫn chạy)
        if (!redisUrl) {
            this.client = null;
            this.logger.warn('REDIS_URL is not configured. Redis cache will be disabled.');
            return;
        }

        /**
         * Khởi tạo Redis client
         */
        this.client = new Redis(redisUrl, {
            lazyConnect: true,        // không connect ngay
            maxRetriesPerRequest: 1,  // tránh retry vô hạn
            enableReadyCheck: true,   // đảm bảo Redis ready
        });

        /**
         * Bắt lỗi runtime từ Redis
         */
        this.client.on('error', (err) => {
            this.logger.error('Redis error:', err);
        });

        /**
         * Connect thủ công (vì lazyConnect = true)
         */
        this.client.connect().catch((err) => { 
            this.logger.error('Failed to connect to Redis:', err);
        });
    }

    /**
     * Lấy dữ liệu JSON từ Redis
     * @param key key trong Redis
     * @returns object hoặc null
     */
    async getJson<T>(key: string): Promise<T | null> {
        if (!this.client) return null;

        try {
            const value = await this.client.get(key);

            // Nếu không có dữ liệu
            if (!value) return null;

            // Parse JSON → object
            return JSON.parse(value) as T;
        } catch (err) {
            this.logger.error(`Failed to get key ${key} from Redis:`, err);
            return null;
        }
    }

    /**
     * Set dữ liệu JSON vào Redis
     * @param key key
     * @param value object cần lưu
     * @param ttlSeconds thời gian sống (giây)
     */
    async setJson<T>(
        key: string,
        value: T,
        ttlSeconds?: number
    ): Promise<void> {
        if (!this.client) return;

        try {
            // Convert object → string
            const stringValue = JSON.stringify(value);

            // Có TTL
            if (ttlSeconds) {
                await this.client.set(key, stringValue, 'EX', ttlSeconds);
            } else {
                // Không TTL → lưu vĩnh viễn
                await this.client.set(key, stringValue);
            }
        } catch (err) {
            this.logger.error(`Failed to set key ${key} in Redis:`, err);
        }
    }

    /**
     * Xóa key
     */
    async del(key: string): Promise<void> {
        if (!this.client) return;

        try {
            await this.client.del(key);
        } catch (err) {
            this.logger.error(`Failed to delete key ${key}:`, err);
        }
    }

    /**
     * Pattern: cache-aside helper (rất hay dùng)
     * - Nếu có cache → trả luôn
     * - Không có → gọi DB rồi set cache
     */
    async getOrSet<T>(
        key: string,
        fetchFn: () => Promise<T>,
        ttlSeconds = 60
    ): Promise<T> {
        if (!this.client) {
            // fallback: gọi thẳng DB
            return fetchFn();
        }

        const cached = await this.getJson<T>(key);
        if (cached) return cached;

        const fresh = await fetchFn();
        await this.setJson(key, fresh, ttlSeconds);

        return fresh;
    }

    /**
     * Lifecycle hook của NestJS
     * - chạy khi app shutdown
     */
    async onModuleDestroy(): Promise<void> {
        if (this.client) {
            await this.client.quit(); // đóng connection sạch
        }
    }
}