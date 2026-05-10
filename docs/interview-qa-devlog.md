# Phỏng vấn kỹ thuật - DevLog (Q&A đào sâu)

> Ghi chú: Mỗi câu trả lời gồm 3 phần Why/How/Example, trình bày high-level, không đi vào code chi tiết.

## 1) Tổng quan giá trị và phạm vi
**Câu hỏi:** Nếu chỉ có 60 giây, bạn mô tả giá trị cốt lõi của project này thế nào và tại sao scope như vậy?

**Trả lời mẫu - Why:** Cần xác định rõ pain point: viết bài kỹ thuật dễ dàng, có tính cộng đồng và có kênh tương tác. Scope giống một social blog nhỏ giúp mình giảm phạm vi, tập trung vào chức năng làm người dùng quay lại.

**Trả lời mẫu - How:** Tôi chia scope thành các nhóm: bài viết, tương tác (like/comment/follow/bookmark), hồ sơ cá nhân và tìm kiếm. Mỗi nhóm là một module rõ ràng để phát triển và mở rộng.

**Trả lời mẫu - Example:** Trong DevLog, người dùng viết post, xem feed, tìm theo tag, follow tác giả và nhận notification khi có tương tác mới.

## 2) Yêu cầu phi chức năng (NFR)
**Câu hỏi:** Khi thiết kế, bạn đặt NFR nào là ưu tiên, và nếu conflict thì giải quyết ra sao?

**Trả lời mẫu - Why:** NFR giúp ra quyết định thiết kế về độ trễ, độ ổn định và chi phí. Nếu không rõ NFR, dễ bị lệch hướng và khó biện minh trade-off.

**Trả lời mẫu - How:** Tôi ưu tiên responsiveness cho luồng đọc (feed, search), và giữ data integrity cho luồng ghi (post, comment). Khi conflict, tôi chọn ổn định và độ chính xác trước, sau đó tối ưu dần cho performance.

**Trả lời mẫu - Example:** DevLog dùng pagination và index để giảm latency khi đọc feed, nhưng vẫn giữ transaction và unique constraint cho like/follow để tránh data sai.

## 3) Tổ chức folder và quản lý repo
**Câu hỏi:** Vì sao bạn tách frontend và backend thành hai folder độc lập trong cùng workspace?

**Trả lời mẫu - Why:** Cần giữ ranh giới rõ ràng giữa UI và API, để trước khi scale có thể build và deploy riêng. Điều này giảm coupling và dễ cho đội ngũ làm việc song song.

**Trả lời mẫu - How:** Tôi gom frontend, backend, docs ở mức gốc, mỗi phần có package.json riêng và luồng build riêng. Các tài liệu deploy và env hướng dẫn để ở docs.

**Trả lời mẫu - Example:** DevLog có folder frontend (Vite/React) và backend (NestJS/Prisma), deploy trên Render thành 2 service độc lập.

## 4) Monolith hay microservices
**Câu hỏi:** Vì sao bạn chọn monolith module-based thay vì microservices ngay từ đầu?

**Trả lời mẫu - Why:** Microservices tăng chi phí vận hành và phức tạp kết nối, trong khi scope chưa cần. Monolith module-based giữ được tốc độ phát triển và vẫn mở đường mở rộng.

**Trả lời mẫu - How:** Tôi tách theo feature module, giới hạn coupling bằng interface và service layer. Khi scale, có thể cắt từng module thành service riêng mà không đập vỡ hợp đồng API.

**Trả lời mẫu - Example:** DevLog chưa cần tách search hay notification thành service riêng, nhưng module đã tách rõ ràng để có thể move khi cần.

## 5) Kiến trúc backend (layered)
**Câu hỏi:** Kiến trúc backend của bạn theo MVC, layered hay clean architecture? Trade-off?

**Trả lời mẫu - Why:** Layered architecture giúp rõ ràng trách nhiệm và dễ kiểm soát logic nghiệp vụ. Clean architecture đầy đủ tốt nhưng có thể quá nặng so với scope.

**Trả lời mẫu - How:** Tôi dùng controller tiếp nhận HTTP, service xử lý logic, ORM cho data access. Các cross-cutting concern như validation, filter, interceptor đặt ở common layer.

**Trả lời mẫu - Example:** DevLog có module posts/comments/likes, mỗi module có controller và service riêng, và dùng global filter để thống nhất error.

## 6) Pipeline tổng thể của request/response
**Câu hỏi:** Bạn mô tả pipeline tổng thể của một request/response trong hệ thống như thế nào?

**Trả lời mẫu - Why:** Nắm pipeline giúp đặt đúng điểm cho bảo mật, validate, logging và xử lý lỗi. Khi có sự cố, biết chính xác request “đi qua những đâu”.

**Trả lời mẫu - How:** Request đi qua CORS và cookie parsing, vào validation pipe, rồi qua guard (auth/role). Sau đó controller nhận request, service xử lý nghiệp vụ và ORM truy vấn DB. Response đi qua interceptor để chuẩn hóa rồi trả về; nếu có lỗi thì exception filter bắt và format lỗi.

**Trả lời mẫu - Example:** Ở DevLog, request tạo post sẽ được CORS check, JWT guard, validate input, rồi service tạo post qua Prisma; response được bọc format thống nhất, lỗi thì filter trả về message chuẩn.

## 7) Boundary giữa các module
**Câu hỏi:** Làm sao bạn giảm coupling giữa các module khi cần truy cập dữ liệu chéo?

**Trả lời mẫu - Why:** Coupling cao làm khó thay đổi và dễ gây bug lan truyền. Cần có ranh giới rõ ràng để module có thể phát triển độc lập.

**Trả lời mẫu - How:** Tôi chỉ chia sẻ interface ở mức service, tránh truy cập trực tiếp table của module khác. Nếu cần, dùng event hoặc service call để đồng bộ.

**Trả lời mẫu - Example:** Comments cần thông tin post, nhưng sẽ gọi post service để validate và lấy thông tin cần thiết thay vì truy cập thẳng.

## 8) Kiến trúc frontend và quản lý state
**Câu hỏi:** Vì sao bạn chọn Redux Toolkit thay vì Context hay Zustand?

**Trả lời mẫu - Why:** Redux Toolkit phù hợp khi có nhiều feature cần chia sẻ state và cần đồng bộ bất đồng bộ với API. Context dễ bị phình to khi state lớn.

**Trả lời mẫu - How:** Tôi tổ chức state theo feature slice, có service layer cho API, và custom hooks để sử dụng thống nhất. UI chỉ biết đến state và action, không biết chi tiết API.

**Trả lời mẫu - Example:** DevLog có slice cho auth, posts, comments, notifications; mỗi slice tự quản lý lifecycle loading và error.

## 9) Tách frontend và backend theo hợp đồng API
**Câu hỏi:** Bạn làm gì để đảm bảo frontend và backend không bị lệch contract?

**Trả lời mẫu - Why:** Khi frontend/backend deploy độc lập, lệch contract là lỗi phổ biến. Cần có hợp đồng rõ ràng để giảm risk.

**Trả lời mẫu - How:** Tôi dùng convention REST, response format thống nhất, và định nghĩa base URL qua env. Nếu cần versioning, sẽ thêm /v1 để tránh breaking change.

**Trả lời mẫu - Example:** DevLog dùng /api cho tất cả endpoints, frontend chỉ cần đổi VITE_API_BASE_URL khi deploy môi trường mới.

## 10) Thiết kế REST resource và naming
**Câu hỏi:** Bạn đặt tên endpoint và resource theo nguyên tắc gì?

**Trả lời mẫu - Why:** Naming rõ ràng giúp team hiểu nhanh và giảm chi phí đọc API. REST resource-based phù hợp với CRUD và quan hệ.

**Trả lời mẫu - How:** Tôi đặt resource theo danh từ số nhiều, nested khi cần context (posts/:id/comments), và giữ method semantic (GET/POST/DELETE). Các action đặc thù thì dẫn đến sub-resource.

**Trả lời mẫu - Example:** DevLog có posts, comments, likes, bookmarks; comment liên quan post nên đi theo posts/:id/comments.

## 11) Versioning API
**Câu hỏi:** Nếu muốn thay đổi contract API, bạn sẽ versioning thế nào và vì sao?

**Trả lời mẫu - Why:** Versioning giúp giữ tính ổn định cho client cũ và cho phép rollout từ từ. Không versioning sẽ gây break khi cập nhật.

**Trả lời mẫu - How:** Tôi ưu tiên path versioning /api/v1, kết hợp deprecation policy. Khi cần, sẽ giữ v1 song song v2 trong một thời gian.

**Trả lời mẫu - Example:** DevLog hiện tại chưa cần versioning, nhưng nếu thay đổi response post detail, tôi sẽ tạo /api/v2/posts để rollout an toàn.

## 12) Pagination và sorting
**Câu hỏi:** Bạn chọn pagination offset hay keyset? Trade-off là gì?

**Trả lời mẫu - Why:** Pagination ảnh hưởng performance và consistency. Offset dễ làm nhưng có thể chậm và gặp duplicate khi data thay đổi.

**Trả lời mẫu - How:** Tôi sử dụng offset cho đơn giản ở giai đoạn đầu, kết hợp index và sort by createdAt. Khi scale, sẽ chuyển sang keyset cho feed lớn.

**Trả lời mẫu - Example:** DevLog dùng page/limit cho list posts và search, có thể nâng cấp sang cursor nếu số lượng bài viết tăng nhanh.


## 13) Infinite scroll (cuộn vô hạn)
**Câu hỏi:** Bạn triển khai infinite scroll như thế nào để không gây load thừa và vẫn ổn định?

**Trả lời mẫu - Why:** Infinite scroll giúp trải nghiệm đọc mượt hơn, nhưng dễ gây quá tải nếu không kiểm soát. Cần đảm bảo không gọi API trùng và không render quá nhiều.

**Trả lời mẫu - How:** Tôi dùng Intersection Observer để trigger fetch khi người dùng gần cuối danh sách, có cờ isLoading/hasMore để tránh gọi lặp. Dữ liệu được append và de-dup theo id; khi vượt ngưỡng, có thể chuyển sang paged hoặc “load more”.

**Trả lời mẫu - Example:** Với feed DevLog, mỗi lần scroll chạm sentinel sẽ gọi API page/limit, append vào danh sách và dừng khi hasMore = false.


## 14) Error handling và response format

**Câu hỏi:** Bạn làm gì để error từ backend nhất quán và dễ debug?

**Trả lời mẫu - Why:** Error không nhất quán làm frontend khó xử lý và mất thời gian debug. Cần format chuẩn để phân loại lỗi nhanh.

**Trả lời mẫu - How:** Tôi dùng global exception filter để chuẩn hóa mã lỗi, message và trace id. Validation error được gom theo field để frontend hiển thị dễ đọc.

**Trả lời mẫu - Example:** DevLog trả về response có status và message thống nhất, frontend có thể hiển thị thông báo lỗi một cách đồng bộ.

## 15) Authentication: JWT và refresh token

**Câu hỏi:** Tại sao bạn chọn JWT access token ngắn hạn + refresh token, thay vì session thường?

**Trả lời mẫu - Why:** JWT giảm tải cho backend và phù hợp deploy stateless. Refresh token giải quyết vấn đề access token hết hạn mà không bắt người dùng đăng nhập lại.
**Trả lời mẫu - How:** Access token ngắn hạn, refresh token dài hơn và lưu an toàn qua HttpOnly cookie. Backend cấp mới access token khi refresh hợp lệ.

**Trả lời mẫu - Example:** DevLog dùng access token cho request bình thường, và refresh token để duy trì đăng nhập khi người dùng quay lại.

## 16) Refresh token rotation và revoke

**Câu hỏi:** Bạn xử lý refresh token rotation và logout như thế nào để tránh bị đánh cắp?

**Trả lời mẫu - Why:** Refresh token bị lộ sẽ cho phép kẻ tấn công duy trì phiên lâu dài. Rotation và revoke giảm nguy cơ.
**Trả lời mẫu - How:** Tôi lưu refresh token theo session, rotate token mới sau mỗi lần refresh, và xóa session khi logout. Nếu phát hiện reuse, có thể revoke tất cả phiên.

**Trả lời mẫu - Example:** DevLog lưu session refresh token trong database, khi logout sẽ xóa session và cookie tương ứng.

## 17) OAuth và liên kết tài khoản

**Câu hỏi:** Khi hỗ trợ Google OAuth, bạn xử lý mapping tài khoản thế nào?

**Trả lời mẫu - Why:** OAuth cần mapping giữa tài khoản ngoài và user nội bộ để tránh trùng lặp. Cần rõ ràng trường hợp email trùng.
**Trả lời mẫu - How:** Tôi tạo bảng Account để lưu provider và providerId, liên kết với User. Nếu email trùng, sẽ link vào user hiện có sau khi verify.

**Trả lời mẫu - Example:** DevLog cho phép đăng nhập bằng Google và liên kết với user để hiển thị thông tin hồ sơ thống nhất.

## 18) Authorization: ownership và role

**Câu hỏi:** Bạn kiểm soát quyền sửa/xóa tài nguyên theo principle nào?

**Trả lời mẫu - Why:** Nếu không kiểm soát ownership, người dùng có thể sửa/xóa dữ liệu của người khác. Cần quy tắc rõ ràng để an toàn.
**Trả lời mẫu - How:** Tôi check ownership trong service layer, chỉ cho tác giả sửa/xóa post hoặc comment. Role-based sẽ là bước tiếp theo nếu cần admin.

**Trả lời mẫu - Example:** DevLog chỉ cho tác giả cập nhật bài viết, còn người khác chỉ có thể xem và tương tác.

## 19) Thiết kế schema cơ bản

**Câu hỏi:** Bạn thiết kế schema cho posts, users, comments, tags thế nào và vì sao?

**Trả lời mẫu - Why:** Schema cần phản ánh luồng nghiệp vụ và giúp query hiệu quả. Đặt đúng quan hệ sẽ giảm phần thay đổi sau này.
**Trả lời mẫu - How:** User có nhiều Post, Post có nhiều Comment, Tag là quan hệ nhiều-nhiều qua bảng liên kết. Các entity tương tác như Like/Bookmark/Follow là quan hệ giữa user và target.

**Trả lời mẫu - Example:** DevLog có User, Post, Comment, Tag, và bảng trung gian cho post-tags để dễ search và filter.

## 20) Indexing và query pattern

**Câu hỏi:** Bạn đặt index ở đâu và dựa trên pattern truy vấn nào?

**Trả lời mẫu - Why:** Index sai làm chậm ghi và tốn bộ nhớ, index đúng giúp đọc nhanh. Cần dựa trên truy vấn thực tế.

**Trả lời mẫu - How:** Tôi index theo createdAt, authorId, postId, và các field được filter nhiều. Các unique constraint đảm bảo idempotency cho like/bookmark/follow.

**Trả lời mẫu - Example:** DevLog đặt index cho truy vấn danh sách post theo tác giả và thời gian, giúp feed load nhanh hơn.

## 21) Soft delete vs hard delete

**Câu hỏi:** Vì sao bạn dùng soft delete cho comment/like/follow?

**Trả lời mẫu - Why:** Soft delete giữ được lịch sử và thống kê, tránh mất dữ liệu khi cần audit. Hard delete chỉ phù hợp khi dữ liệu không cần truy vết.

**Trả lời mẫu - How:** Tôi thêm flag active và lọc theo active = true cho luồng hiển thị. Khi cần khôi phục, chỉ cần bật lại.

**Trả lời mẫu - Example:** DevLog dùng active flag cho comment và follow, nên có thể tăng giảm mà không mất lịch sử.

## 22) Slug và đường dẫn bài viết

**Câu hỏi:** Bạn tạo slug như thế nào và xử lý đổi tiêu đề ra sao?

**Trả lời mẫu - Why:** Slug giúp SEO và URL dễ nhớ, nhưng cần đảm bảo unique và không vỡ link cũ. Cần có quyết định về immutable hay mutable slug.

**Trả lời mẫu - How:** Tôi tạo slug từ tiêu đề và lưu vào database, có unique constraint. Nếu đổi tiêu đề, tôi ưu tiên giữ slug cũ để tránh break link, hoặc tạo redirect.

**Trả lời mẫu - Example:** DevLog sử dụng slug cho /posts/:slug, lưu slug ở Post để truy cập nhanh.

## 23) Concurrency: like/follow double click

**Câu hỏi:** Nếu người dùng click like 2 lần gần như đồng thời, bạn xử lý thế nào?

**Trả lời mẫu - Why:** Race condition có thể tạo dữ liệu trùng hoặc sai thống kê. Cần idempotent để tránh bug.

**Trả lời mẫu - How:** Tôi dùng unique constraint (postId, userId) và xử lý upsert, chỉ cập nhật active. Nếu request đến trùng lúc, DB sẽ bảo đảm tính nhất quán.

**Trả lời mẫu - Example:** DevLog cập nhật active flag cho like/bookmark/follow, nên nhận request trùng lặp sẽ không tạo row mới.

## 24) Concurrency: comment và notification

**Câu hỏi:** Bạn đảm bảo comment và notification không bị lệch thế nào?

**Trả lời mẫu - Why:** Nếu comment tạo thành công nhưng notification fail, user sẽ mất thông tin. Cần xử lý nhất quán hoặc có cơ chế bù.

**Trả lời mẫu - How:** Tôi ghi comment trước, sau đó tạo notification. Nếu notification thất bại, log lại và có thể retry bằng job sau.

**Trả lời mẫu - Example:** DevLog tạo notification khi có comment mới, và nếu có sự cố, nó chỉ ảnh hưởng thông báo chứ không ảnh hưởng comment.

## 25) Thiết kế search

**Câu hỏi:** Vì sao bạn dùng full-text search trong PostgreSQL thay vì Elasticsearch?

**Trả lời mẫu - Why:** Full-text trong Postgres đơn giản và đủ cho quy mô nhỏ, giảm phụ thuộc hệ thống ngoài. Elasticsearch chỉ cần khi traffic và nhu cầu search lớn.

**Trả lời mẫu - How:** Tôi dùng tsquery/tsvector ở Postgres, kết hợp index và pagination. Khi vượt ngưỡng, có thể tách sang search service riêng.

**Trả lời mẫu - Example:** DevLog search posts/users/tags bằng Postgres full-text, đặt index để giảm độ trễ.

## 26) Cách chọn dữ liệu để cache

**Câu hỏi:** Bạn chọn cache những gì và dựa trên tiêu chí nào?

**Trả lời mẫu - Why:** Cache sai có thể gây stale data, cache đúng giúp giảm latency và giảm load DB. Cần chọn data đọc nhiều và ít thay đổi.

**Trả lời mẫu - How:** Tôi cache feed và các list truy vấn nhiều, đặt TTL hợp lý. Data thay đổi liên tục sẽ không cache hoặc cache ngắn hạn.

**Trả lời mẫu - Example:** DevLog hiện tại chưa implement Redis cache, nhưng khi traffic tăng có thể thêm để cache kết quả list posts và giảm truy vấn lặp lại.

## 27) Cache invalidation

**Câu hỏi:** Bạn invalidate cache như thế nào khi data thay đổi?

**Trả lời mẫu - Why:** Cache stale là lỗi khó debug. Invalidation cần rõ ràng để giữ data đúng.

**Trả lời mẫu - How:** Tôi dùng TTL và invalidation theo key khi có create/update/delete. Nếu có nhiều key liên quan, dùng prefix và xóa theo nhóm.

**Trả lời mẫu - Example:** Khi implement cache, tôi sẽ xóa cache feed chung và cache theo tag liên quan khi có post mới.

## 28) Tối ưu payload và N+1

**Câu hỏi:** Bạn làm gì để giảm payload và tránh N+1 queries?

**Trả lời mẫu - Why:** Payload lớn làm chậm frontend, N+1 làm tăng query DB. Cần tối ưu để có performance ổn định.

**Trả lời mẫu - How:** Tôi chỉ trả về các field cần thiết cho từng view, và group query theo batch. Chỉ load chi tiết khi vào trang detail.

**Trả lời mẫu - Example:** DevLog trả về thông tin post summary trong feed, còn post detail mới lấy thêm comments và interaction detail.

## 29) Upload file và bảo mật

**Câu hỏi:** Bạn xử lý upload ảnh như thế nào để đảm bảo an toàn?

**Trả lời mẫu - Why:** Upload file là điểm rủi ro cao (file độc hại, kích thước lớn). Cần có validation và storage ngoài.

**Trả lời mẫu - How:** Tôi giới hạn kích thước, loại file, và lưu qua cloud storage thay vì server local. Backend chỉ nhận file, validate, rồi gửi lên storage.

**Trả lời mẫu - Example:** DevLog dùng Cloudinary cho cover image và avatar, có giới hạn format và size để tránh spam.

## 30) Notification system

**Câu hỏi:** Bạn thiết kế notification như thế nào, và tại sao không dùng queue ngay?

**Trả lời mẫu - Why:** Notification là feature tăng engagement, nhưng cần cân nhắc chi phí. Queue chỉ cần khi luồng sự kiện lớn.

**Trả lời mẫu - How:** Tôi lưu notification trong DB với type và read flag. Hiện tại xử lý đồng bộ, nhưng có thể tách thành job khi scale.

**Trả lời mẫu - Example:** DevLog tạo notification cho follow/comment/like, và có thể thêm email thông báo bằng Nodemailer.

## 31) Logging

**Câu hỏi:** Bạn log những gì và sử dụng log để làm gì?

**Trả lời mẫu - Why:** Logging giúp debug và theo dõi sự cố. Nếu không log, sẽ mù mờ khi có lỗi sản xuất.

**Trả lời mẫu - How:** Tôi log request, error, và các sự kiện quan trọng (login, create post). Log có cấp độ (info/warn/error) và gom thông tin để truy vết.

**Trả lời mẫu - Example:** DevLog có log khi lỗi validation hoặc lỗi DB, để có thể truy ra request nào gây ra.

## 32) Monitoring và alerting

**Câu hỏi:** Bạn theo dõi hệ thống như thế nào trong production?

**Trả lời mẫu - Why:** Không monitoring thì khi có sự cố sẽ biết muộn. Cần theo dõi health, latency và error rate.

**Trả lời mẫu - How:** Tôi dùng health check endpoint, theo dõi log từ Render, và có thể tích hợp APM sau. Alert sẽ dựa trên error rate hoặc downtime.

**Trả lời mẫu - Example:** DevLog có health check /api, Render sẽ báo khi service không respond.

## 33) Validation và sanitization

**Câu hỏi:** Bạn xử lý input validation và ngăn XSS như thế nào?

**Trả lời mẫu - Why:** Dữ liệu từ client không đáng tin, cần validate để bảo vệ DB và logic. Content rich text có nguy cơ XSS.

**Trả lời mẫu - How:** Tôi validate DTO ở gateway, và sanitize content khi cần (ví dụ: markdown). Chỉ chấp nhận field hợp lệ và loại bỏ script.

**Trả lời mẫu - Example:** DevLog validate data khi tạo post/comment và loại bỏ HTML nguy hiểm trong nội dung.

## 34) Error boundary ở frontend

**Câu hỏi:** Bạn xử lý lỗi ở frontend ra sao để không vỡ UI?

**Trả lời mẫu - Why:** Lỗi UI có thể làm trắng trang. Cần có error boundary và thông báo rõ ràng.

**Trả lời mẫu - How:** Tôi dùng error boundary cho các khu vực lớn, và thông báo toast cho API error. Data fetching có retry hợp lý.

**Trả lời mẫu - Example:** DevLog hiện thông báo lỗi nếu fetch post thất bại, và giữ UI có thể thao tác tiếp.

## 35) Testing strategy

**Câu hỏi:** Bạn test ở những lớp nào và tại sao?

**Trả lời mẫu - Why:** Test giúp giảm regression, nhất là logic nghiệp vụ. Cần cân đối giữa test unit, integration và e2e.

**Trả lời mẫu - How:** Tôi ưu tiên unit test cho service quan trọng, integration test cho API, và một số e2e cho flow chính. Coverage tập trung vào nơi có risk cao.

**Trả lời mẫu - Example:** DevLog có thể test flow đăng nhập, tạo post và comment thông qua API để đảm bảo luồng chính ổn định.

## 36) CI/CD pipeline

**Câu hỏi:** Bạn thiết kế CI/CD ra sao, và nếu build fail thì xử lý thế nào?

**Trả lời mẫu - Why:** CI/CD giúp tự động hóa deploy và giảm lỗi thủ công. Cần có gate để ngăn code lỗi lên production.

**Trả lời mẫu - How:** Tôi dùng auto-deploy khi merge main, build backend và frontend riêng, chạy migrate trong startup. Nếu build fail, deployment sẽ dừng và giữ version cũ.

**Trả lời mẫu - Example:** DevLog deploy trên Render, build command gồm prisma generate và build, nếu fail thì không rollout.

## 37) Docker và local dev

**Câu hỏi:** Docker dùng ở đâu trong quy trình phát triển?

**Trả lời mẫu - Why:** Docker giúp chạy consistent giữa máy dev và prod, và dễ setup DB/Redis. Nếu team lớn, sẽ giảm time onboarding.

**Trả lời mẫu - How:** Tôi dùng docker-compose cho DB/Redis local, còn app chạy trên Node để dễ debug. Khi cần, có thể đóng gói app thành image.

**Trả lời mẫu - Example:** DevLog có docker-compose cho backend, giúp chạy Postgres và Redis nhanh khi dev.

## 38) HTTPS và reverse proxy

**Câu hỏi:** Bạn đảm bảo HTTPS và reverse proxy như thế nào?

**Trả lời mẫu - Why:** HTTPS là bắt buộc để bảo vệ token và data. Reverse proxy giúp TLS termination và security headers.

**Trả lời mẫu - How:** Trên Render, TLS được quản lý tự động. Nếu self-host, tôi sẽ dùng Nginx làm TLS termination và forward về app.

**Trả lời mẫu - Example:** DevLog deploy trên Render nên có HTTPS mặc định, không cần tự quản lý cert.

## 39) Scalability cho backend

**Câu hỏi:** Nếu traffic tăng 10x, bạn scale backend thế nào?

**Trả lời mẫu - Why:** Backend phải stateless để scale ngang. Nếu có state, sẽ khó tăng instance.

**Trả lời mẫu - How:** Tôi giữ auth trên cookie và DB, không giữ session trong memory. Khi scale, chỉ cần tăng số instance, cache và DB sẽ xử lý tải chung.

**Trả lời mẫu - Example:** DevLog lưu session refresh token trong DB, nên có thể thêm instance backend mà không cần sticky session.

## 40) Database scaling và connection pooling

**Câu hỏi:** Bạn xử lý kết nối DB và pool như thế nào để tránh vượt giới hạn?

**Trả lời mẫu - Why:** Kết nối DB là tài nguyên đắt, vượt giới hạn sẽ gây downtime. Cần pool và tách read/write khi cần.

**Trả lời mẫu - How:** Tôi dùng connection pool của provider, và tách direct URL cho migration. Khi scale, có thể thêm read replica cho query đọc.

**Trả lời mẫu - Example:** DevLog dùng Neon Postgres với pooled URL cho runtime và direct URL cho migration.

## 41) Migrations và backward compatibility

**Câu hỏi:** Bạn quản lý migration thế nào để không gây downtime?

**Trả lời mẫu - Why:** Migration sai có thể làm lỗi production. Cần quy trình để giữ compatibility.

**Trả lời mẫu - How:** Tôi dùng migration tự động, rollout theo bước, và tránh thay đổi phá vỡ schema khi client cũ chưa cập nhật. Nếu cần, sẽ thêm field mới trước, xóa field cũ sau.

**Trả lời mẫu - Example:** DevLog dùng Prisma migration, run deploy migration trước khi start app trong production.

## 42) Seed data và setup dev

**Câu hỏi:** Bạn làm gì để team có dữ liệu mẫu phục vụ dev?

**Trả lời mẫu - Why:** Seed data giúp dev và test nhanh, giảm thời gian tạo data thủ công. Đồng thời giúp demo feature.

**Trả lời mẫu - How:** Tôi viết script seed có thể reset data, có guard để tránh xóa nhầm production. Data được tạo sát với use case thực tế.

**Trả lời mẫu - Example:** DevLog có script seed tạo user, post, comment, like và follow để demo feed và notification.

## 43) Rate limiting và chống abuse

**Câu hỏi:** Nếu bị spam request, bạn sẽ bảo vệ hệ thống thế nào?

**Trả lời mẫu - Why:** Endpoint công khai có thể bị abuse, gây tăng chi phí và downtime. Cần có cơ chế giới hạn từ sớm.

**Trả lời mẫu - How:** Tôi sẽ áp dụng rate limit theo IP/user, kết hợp captcha cho đăng ký. Nếu cần, thêm WAF ở edge.

**Trả lời mẫu - Example:** DevLog hiện tại chưa bật rate limit, nhưng nếu traffic tăng sẽ thêm limiter cho login và create post.

## 44) Hướng mở rộng với queue và async job

**Câu hỏi:** Nếu notification và email tăng mạnh, bạn sẽ redesign thế nào?

**Trả lời mẫu - Why:** Xử lý đồng bộ sẽ làm chậm request và tăng timeouts. Queue giúp xử lý bất đồng bộ và retry.

**Trả lời mẫu - How:** Tôi tách notification/email thành background job, dùng message queue và worker. API chỉ ghi event, worker xử lý sau.

**Trả lời mẫu - Example:** DevLog có thể đẩy sự kiện "NEW_COMMENT" vào queue, worker sẽ gửi email và cập nhật notification.

## 45) Text Editor Implementation (TipTap)

**Câu hỏi:** Bạn triển khai text editor cho người dùng viết post như thế nào?

**Trả lời mẫu - Why:** Editor cần balance giữa UX mượt và output chuẩn để render đa nền tảng. Markdown là lựa chọn tốt vì readable, portable, và dễ version control.

**Trả lời mẫu - How:** Tôi dùng TipTap (ProseMirror-based) vì extensible và output JSON/Markdown chuẩn. Hỗ trợ Markdown shortcuts (type `##` → heading), live preview toggle, và rich media embed (image, code block, link). Content được parse thành structured JSON để lưu trữ.

**Trả lời mẫu - Example:** DevLog dùng TipTap với extensions: StarterKit, Placeholder, Image, CodeBlock, Link, History. Người dùng viết bằng Markdown syntax hoặc toolbar, editor chuyển thành JSON document structure.

## 46) Markdown Storage Strategy

**Câu hỏi:** Khi lưu post, bạn lưu markdown thô hay parsed content? Vì sao?

**Trả lời mẫu - Why:** Decision này ảnh hưởng tới flexibility (có thể đổi renderer sau này) và query capability (tìm kiếm trong content). Cần balance giữa portability và performance.

**Trả lời mẫu - How:** Tôi lưu cả 2: JSON document (TipTap output) làm source of truth để edit sau, và HTML/Markdown cached cho render nhanh. Database chỉ lưu JSON string, render server-side hoặc client-side khi display. Nếu chỉ lưu Markdown thô, sẽ mất metadata như image position, code block language.

**Trả lời mẫu - Example:** DevLog lưu content dạng JSON trong Post.content: `{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"Hello"}]}]}`. Khi render, dùng `@tiptap/html` hoặc client-side renderer để chuyển thành HTML. Có thể export thành Markdown thuần bằng `tiptap-markdown` extension.

## 47) Reading Time & Word Count

**Câu hỏi:** Bạn tính "bài này bao nhiêu phút đọc" và "bao nhiêu chữ" như thế nào? Tối ưu ra sao?

**Trả lời mẫu - Why:** Reading time giúp người dùng ước lượng effort trước khi đọc. Cần chuẩn và nhanh, không block render.

**Trả lời mẫu - How:** 
- Word count: Parse content, loại bỏ markdown syntax, đếm từ theo whitespace. Tiếng Anh: ~200-250 words/phút. Tiếng Việt: ~400-500 từ/phút (do ngắn hơn).
- Tối ưu: Tính ở backend khi save post, lưu vào column `readingTime` và `wordCount`. Frontend chỉ display, không tính lại. Nếu content dài (>10k words), dùng Web Worker hoặc lazy calculate.
- Code block/image được đếm khác: code 1 dòng = 0.5s, 1 image = 10s view time.

**Trả lời mẫu - Example:** DevLog dùng thư viện `reading-time` cho tiếng Anh, custom algorithm cho tiếng Việt (dựa trên số từ và dấu câu). Kết quả lưu vào Post.readingTimeMinutes và Post.wordCount, trả về API cùng post detail.

## 48) Auto-save & Draft Management

**Câu hỏi:** Bạn xử lý auto-save và draft như thế nào để không mất content?

**Trả lời mẫu - Why:** Người dùng có thể accidentally refresh, close tab, hoặc mất connection. Auto-save giảm anxiety và giữ progress.

**Trả lời mẫu - How:** Dùng debounce (3-5s sau khi ngừng typing) để auto-save vào localStorage và backend. Draft được lưu riêng bảng PostDrafts hoặc status = DRAFT trong Posts. Khi publish, xóa draft và tạo published post. Conflict resolution: last-write-wins với timestamp check.

**Trả lời mẫu - Example:** DevLog auto-save mỗi 5s idle time, lưu localStorage trước để không mất khi offline. Backend nhận draft qua `PATCH /posts/:id/draft`. Khi user mở lại editor, kiểm tra có draft chưa publish và suggest restore.

## 49) Image Upload & Processing

**Câu hỏi:** Bạn xử lý upload và chèn ảnh vào editor thế nào?

**Trả lời mẫu - Why:** Upload ảnh inline cần UX mượt (drag-drop, paste), nhưng cũng phải optimize kích thước và format để không chậm page.

**Trả lời mẫu - How:** Dùng Cloudinary hoặc S3. Flow: user paste/drop → frontend resize/compress (max 5MB) → upload lên cloud → trả về URL → insert vào TipTap Image node. Backend validate file type và scan virus nếu cần. Dùng lazy loading và blur placeholder cho ảnh lớn.

**Trả lời mẫu - Example:** DevLog dùng Cloudinary với preset: upload từ editor → Cloudinary trả về URL variants (small, medium, large) → lưu responsive srcset vào content. TipTap Image extension render với lazy loading.

## 50) Code Syntax Highlighting

**Câu hỏi:** Bạn highlight code trong post như thế nào?

**Trả lời mẫu - Why:** Code block là core feature cho dev blog. Cần highlight chuẩn và performance tốt.

**Trả lời mẫu - How:** TipTap CodeBlock extension lưu language info. Server-side: dùng `highlight.js` hoặc `shiki` để parse và thêm class. Client-side: dùng `prismjs` hoặc `highlight.js` dynamic import theo language cần thiết để giảm bundle size. Line numbers và copy button là UI enhancements.

**Trả lời mẫu - Example:** DevLog dùng TipTap CodeBlock với Lowlight (highlight.js wrapper). Languages được lazy-loaded: `const languages = { javascript: () => import('highlight.js/lib/languages/javascript') }`. Copy button dùng Clipboard API.

## 51) Search Indexing for Posts

**Câu hỏi:** Bạn cho phép tìm kiếm full-text trong post content như thế nào?

**Trả lời mẫu - Why:** Users cần tìm lại bài viết đã đọc hoặc khám phá content theo topic. Full-text search cần nhanh và relevance tốt.

**Trả lời mẫu - How:** PostgreSQL có sẵn full-text search với `tsvector` và `tsquery`. Tạo generated column `searchVector` từ title + content (strip markdown), GIN index để query nhanh. Nếu scale lên, migrate sang Elasticsearch hoặc Algolia cho typo-tolerance và faceted search.

**Trả lời mẫu - Example:** DevLog có Prisma schema: `searchVector Unsupported("tsvector")?` và index `@@index([searchVector], name: "post_search_idx", type: Gin)`. Search API: `SELECT * FROM posts WHERE searchVector @@ plainto_tsquery('english', $1)`.

## 52) SEO & Meta Tags

**Câu hỏi:** Bạn optimize SEO cho post detail page thế nào?

**Trả lời mẫu - Why:** SEO giúp content discoverable qua Google. Cần SSR hoặc dynamic meta tags cho social sharing.

**Trả lời mẫu - How:** Dùng React Helmet Async để inject meta tags client-side, nhưng tốt hơn là SSR với NestJS EJS template hoặc Next.js. Meta cần: title, description (truncate content), OG image (cover image hoặc fallback), canonical URL, author. Sitemap.xml và robots.txt cho crawlers.

**Trả lời mẫu - Example:** DevLog backend có endpoint `/posts/:slug/meta` trả về meta data, frontend dùng React Helmet để inject. Share link lên Twitter/LinkedIn hiển thị card đẹp với cover image và excerpt.
