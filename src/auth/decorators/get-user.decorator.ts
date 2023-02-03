import { createParamDecorator, ExecutionContext, InternalServerErrorException } from "@nestjs/common";

export const GetUser = createParamDecorator(
    (data: string, ctx: ExecutionContext) => {

        const req = ctx.switchToHttp().getRequest(); // con esto obtengo toda la información del usuario
        const user = req.user;

        if(!user)
            throw new InternalServerErrorException('User not found (request)');
        return (!data) ? user : user[data]; // esto es un ternario.
        
    }
)