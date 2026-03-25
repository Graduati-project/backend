# Patient Management System API (Postman Guide)

Base URL:

`http://localhost:3000`

## Response Format

- Success (most endpoints):
  - `{ "message": "Success", "data": {} }`
- Error:
  - `{ "message": "Error message", "stack": "..." }`

## Authentication

For protected endpoints, add header:

- `Authorization: Bearer <access_token>`

Get `access_token` from `POST /auth/login`.

---

## 1) Auth Module (`/auth`)

### `POST /auth/signup`
Create new user (default role: patient).

Body (JSON):

```json
{
  "firstName": "Ali",
  "lastName": "Hassan",
  "email": "ali@test.com",
  "password": "123456",
  "confirmPassword": "123456",
  "phone": "01000000000"
}
```

Success:

```json
{
  "message": "User created successfully",
  "data": {
    "_id": "...",
    "firstName": "Ali",
    "lastName": "Hassan",
    "email": "ali@test.com"
  }
}
```

---

### `POST /auth/login`
Login and get tokens.

Body (JSON):

```json
{
  "email": "ali@test.com",
  "password": "123456"
}
```

Success:

```json
{
  "message": "Login successful",
  "access_token": "<jwt>",
  "refresh_token": "<jwt>",
  "role": "patient"
}
```

---

### `PATCH /auth/send-reset-password`
Send OTP to email (cooldown: 2 minutes).

Body (JSON):

```json
{
  "email": "ali@test.com"
}
```

Success:

```json
{
  "message": "Reset code sent successfully to your email",
  "data": {}
}
```

Possible errors:

- `404`: User not found
- `429`: Please wait X seconds before requesting another OTP

---

### `PATCH /auth/reset-password`
Reset password with OTP.

Body (JSON):

```json
{
  "email": "ali@test.com",
  "otp": "123456",
  "newPassword": "new123456"
}
```

Success:

```json
{
  "message": "Password reset successfully",
  "data": {}
}
```

---

## 2) User Module (`/user`)

> Protected endpoints (need Bearer token).

### `GET /user/profile`
Get current user profile.

Success:

```json
{
  "message": "Success",
  "data": {
    "_id": "...",
    "firstName": "Ali",
    "lastName": "Hassan"
  }
}
```

---

### `PATCH /user/update`
Update basic info.

Body (JSON):

```json
{
  "firstName": "Ali",
  "lastName": "Mahmoud",
  "gender": "male"
}
```

---

### `PATCH /user/update-password`
Update password.

Body (JSON):

```json
{
  "oldPassword": "123456",
  "newPassword": "654321",
  "confirmNewPassword": "654321",
  "flag": "signout"
}
```

---

### `POST /user/logout`
Logout from current/all devices.

Body (JSON):

```json
{
  "flag": "allDevices"
}
```

`flag` values:

- `allDevices`
- `signout`
- `""` (stay logged in)

---

### `PATCH /user/profile-image`
Upload profile image (form-data).

Form-data:

- key: `image` (type file)

---

### `GET /user/all`
Get all users (admin/staff).

---

### `POST /user/add-doctor`
Add doctor account (admin/staff).  
Rule: one doctor per specialty.

Body (JSON):

```json
{
  "firstName": "Mona",
  "lastName": "Tarek",
  "email": "doc@test.com",
  "password": "123456",
  "confirmPassword": "123456",
  "specialtyId": "665f0f1b2b3c4d5e6f7a8b9c"
}
```

---

### `PATCH /user/restore-account/:userId`
Restore frozen account (admin only).

---

### `DELETE /user/:userId`
Delete frozen account permanently (admin only).

---

### `DELETE /user/{/:userId}/frezze-account`
Freeze account (current path in code).  
Note: route contains a typo/format issue in controller and should normally be `/user/:userId/frezze-account` or `/user/frezze-account`.

---

## 3) Appointments Module (`/appointments`)

### `GET /appointments/doctors`
Public list of doctors with specialty data.

---

### `POST /appointments/reservation/:doctorID`
Book appointment (patient authenticated).

Body (JSON):

```json
{
  "day": "sunday",
  "hour": "13:00"
}
```

Rules applied:

- Hour must be in doctor schedule.
- Slot must be available.
- Patient cannot book with multiple doctors in same specialty.
- Doctor daily limit is 30 appointments.

Success:

```json
{
  "message": "Appointment booked successfully",
  "data": {
    "appointment": {
      "_id": "...",
      "doctorId": "...",
      "patientId": "...",
      "status": "pending"
    }
  }
}
```

---

## 4) Doctor Module (`/doctor`)

> All endpoints require doctor role.

### `GET /doctor/appointments`
Get doctor appointments.

### `GET /doctor/patients`
Get unique patients followed by doctor.

### `PATCH /doctor/appointments/:appointmentId/status`
Update appointment status.

Body (JSON):

```json
{
  "status": "confirmed"
}
```

Allowed status:

- `confirmed`
- `cancelled`
- `completed`

### `POST /doctor/treatments`
Create treatment for assigned patient.

Body (JSON):

```json
{
  "patientId": "665f0f1b2b3c4d5e6f7a8b9c",
  "treatmentName": "Antibiotic 7 days",
  "startDate": "2026-03-10T00:00:00.000Z",
  "endDate": "2026-03-17T00:00:00.000Z"
}
```

### `PATCH /doctor/treatments/:treatmentId`
Update treatment.

Body (JSON) (any of):

```json
{
  "treatmentName": "Updated plan",
  "endDate": "2026-03-20T00:00:00.000Z"
}
```

---

## 5) Staff Module (`/staff`)

> Require role `staff` or `admin`.

### `POST /staff/doctors`
Add doctor (same payload as `/user/add-doctor`).

### `GET /staff/patients`
Get all patients.

### `GET /staff/patients/:patientId`
Get patient details + appointments + treatments.

---

## 6) Patient Module (`/patient`)

> Require role `patient`.

### `GET /patient/specialties`
Get specialties and doctors.

Optional query:

- `specialtyId=<ObjectId>`

Example:

`GET /patient/specialties?specialtyId=665f0f1b2b3c4d5e6f7a8b9c`

### `GET /patient/appointments`
Get my appointments.

### `GET /patient/treatments`
Get my treatments.

### `GET /patient/my-doctors`
Get doctors currently following me.

---

## Common Postman Setup

1. Create environment variable:
   - `baseUrl = http://localhost:3000`
2. Login and save token:
   - `access_token`
3. In protected requests add:
   - `Authorization: Bearer {{access_token}}`
4. For file upload endpoints, use `form-data`.

