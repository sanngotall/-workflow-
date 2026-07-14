export declare class AddMemberItemDto {
    user_id: string;
    role: string;
}
export declare class AddMembersDto {
    members: AddMemberItemDto[];
}
export declare class UpdateMemberRoleDto {
    role: string;
}
export declare class SearchAvailableUsersDto {
    keyword?: string;
    page?: string;
    pageSize?: string;
}
