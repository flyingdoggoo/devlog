import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

export function SetUpSwagger(app) {
    const config = new DocumentBuilder()
        .setTitle('DevLog API')
        .setDescription('The DevLog API description')
        .setVersion('1.0')
        .addTag('devlog')
        .addCookieAuth('Authentication', {
            type: 'apiKey',
            in: 'cookie',
            name: 'Authentication',
            description: 'JWT token in HttpOnly cookie',
        }, 'cookieAuth')
        .build()
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document);
}
