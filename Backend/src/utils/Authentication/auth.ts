import env from "dotenv";
import bcrypt from "bcrypt";

env.config();

export function HashingFunction(password: string, numberOfRounds: number){
    if (!numberOfRounds) {
        throw new Error("SALT_ROUNDS is not defined in the environment variables");
    }
    return bcrypt.hashSync(password, Number(numberOfRounds));
}

export function CompareFunction(password: string, hashedPassword: string) {
    return bcrypt.compareSync(password, hashedPassword);
}