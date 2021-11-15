/**
 * Auth header for rest api.
 * @returns {Readonly<{Authorization: string}>|Readonly<{}>}
 */
export default function authHeader() {
    const user = JSON.parse(localStorage.getItem('user'));
    return user && user.token ?
        Object.freeze({Authorization: 'Bearer ' + user.token}) :
        Object.freeze({});
}