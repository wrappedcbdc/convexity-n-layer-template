import { Response } from 'express';

export class Cookies {

    private static cookie: string;

    static set(name: string, res: Response, token: string | null) {
        Cookies.cookie = name;
        if (typeof res?.cookie === 'function') {
            res?.cookie(name, token, {
                httpOnly: true,
                secure: true,
                sameSite: 'none',
                maxAge: 1000 * 60 * 60 * 24 * 7
            });
        }
    }

    static remove(res: Response) {
        res.clearCookie(Cookies.cookie);
    }

}
