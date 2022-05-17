import { Injectable } from '@angular/core';
import { JwtHelperService } from '@auth0/angular-jwt';
import { Remult } from 'remult';
import { User } from './users/user';


@Injectable({
    providedIn: 'root'
})
export class AuthService {
    async signIn(username: string, password: string) {
        this.setAuthToken(await User.signIn(username, password));
    }

    setAuthToken(token: string) {
        this.remult.setUser(new JwtHelperService().decodeToken(token));
        localStorage.setItem(AUTH_TOKEN_KEY, token);
    }

    signOut() {
        this.remult.setUser(undefined!);
        localStorage.removeItem(AUTH_TOKEN_KEY);
    }

    static fromStorage(): string {
        return localStorage.getItem(AUTH_TOKEN_KEY)!;
    }

    constructor(private remult: Remult) {
        let token = AuthService.fromStorage();
        if (token) {
            this.setAuthToken(token);
        }
    }
}
const AUTH_TOKEN_KEY = "authToken";