import { ApiProperty } from "@nestjs/swagger";

export class CreateFollowDto {
    @ApiProperty({
        description: 'ID of the user to follow',
        example: '1137c1fe-83aa-456a-83fe-ef522f5a9abb'
    })
    toUserId: string;
}
