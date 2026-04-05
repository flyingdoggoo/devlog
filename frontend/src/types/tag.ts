export interface Tag {
  id: string;
  name: string;
  postCount?: number;
}

export interface CreateTagDto {
  name: string;
}

export interface UpdateTagDto extends Partial<CreateTagDto> {}
