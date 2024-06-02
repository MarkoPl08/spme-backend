const originalConsoleError = console.error;
beforeAll(() => {
    console.error = (...args) => {
        if (args[0].includes('Unable to connect to the database')) return;
        if (args[0].includes('Missing required fields')) return;
        if (args[0].includes('Invalid email format')) return;
        if (args[0].includes('Username or email already exists')) return;
        if (args[0].includes('Error during registration')) return;
        originalConsoleError(...args);
    };
});

afterAll(() => {
    console.error = originalConsoleError;
});
