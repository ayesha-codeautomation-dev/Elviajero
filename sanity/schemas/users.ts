export default {
    name: "user",
    title: "User",
    type: "document",
    fields: [
      {
        name: "email",
        title: "Email",
        type: "string",
        validation: (Rule: { required: () => { (): any; new(): any; email: { (): any; new(): any; }; }; }) => Rule.required().email(),
      },
      {
        name: "password",
        title: "Password",
        type: "string",
        description: "Hashed password",
        validation: (Rule: { required: () => any; }) => Rule.required(),
      },
      {
        name: 'verificationCode',
        type: 'string', // Store the verification code here
        title: 'Verification Code',
      },
      {
        name: "role",
        title: "Role",
        type: "string",
        options: {
          list: [
            { title: "Admin", value: "admin" },
            { title: "User", value: "user" },
          ],
        },
        initialValue: "user",
      },
    ],
  };
  