export interface Tag {
  id: string;
  name: string;
}

export interface CreateTagDto {
  name: string;
}

export interface UpdateTagDto extends Partial<CreateTagDto> {}
