import { ApiProperty } from "@nestjs/swagger";

import { IsNotEmpty, IsUUID } from "class-validator";

export class CreateFollowDto {
    @ApiProperty({
        description: 'ID of the user to follow',
        example: '1137c1fe-83aa-456a-83fe-ef522f5a9abb'
    })
    @IsUUID('4', { message: 'toUserId must be a valid UUID' })
    @IsNotEmpty({ message: 'toUserId should not be empty' })
    toUserId: string;
}
