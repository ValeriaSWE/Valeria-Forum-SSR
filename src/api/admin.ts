import axios from "axios";
import { URL } from "./common";

export const GetUserList = (token: string) => axios.get(`${URL}/admin/getUserList`, {
    headers: {
        'Authorization': `Bearer ${token}`
    }
})

export const SetUserRole = (token: string, id: string, newRole: string, newRoleRank: number) => axios.post(`${URL}/admin/setUserRole`, { id, newRole, newRoleRank }, {
    headers: {
        'Authorization': `Bearer ${token}`
    }
})