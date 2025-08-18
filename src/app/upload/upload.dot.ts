import { IsEnum, IsNotEmpty } from "class-validator";

enum loc {
    GAME = "game",
    BANNER = "banner",
    TIM = "tim",
    USER = "user",
    TOURNAMENT = "tournament",
    ARTICLE = "article",
    OTHER = "other"

}

export class UploadDto {
    @IsEnum(loc, {message: "loc must be correct"})
    @IsNotEmpty()
    loc: loc
}