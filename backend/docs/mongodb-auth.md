# MongoDB Auth Notes

## Collections

### users

```ts
interface UserDocument {
  _id: ObjectId
  username: string
  email: string
  passwordHash: string
  createdAt: Date
  updatedAt: Date
}
```

Indexes:

```ts
{ email: 1 }, unique
{ username: 1 }, unique
```

Passwords are never stored directly. The backend stores a `scrypt` hash with a random salt.

### sessions

```ts
interface SessionDocument {
  _id: ObjectId
  userId: ObjectId
  createdAt: Date
  expiresAt: Date
  absoluteExpiresAt: Date
}
```

Indexes:

```ts
{ userId: 1 }
{ expiresAt: 1 }, TTL
```

## Session Rules

- Login/signup creates a session that expires in 7 days.
- Calling `GET /auth/me` refreshes the session to another 7 days.
- The refresh is capped by `absoluteExpiresAt`.
- No session can live longer than 90 days from creation.
- Logout deletes the session document and clears the cookie.

## Cookie

The JWT is stored in an HTTP-only cookie named `ticflow_session`.

Cookie flags:

```txt
HttpOnly
SameSite=Lax
Path=/
Secure when COOKIE_SECURE=true
```

Use `COOKIE_SECURE=false` for local HTTP development. Use `COOKIE_SECURE=true` in production HTTPS.
