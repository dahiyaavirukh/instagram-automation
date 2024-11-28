const webdriverio = require('webdriverio');
const { assert } = require('chai');

describe('Instagram Login Tests', function() {
    let driver;

    before(async function() {
        this.timeout(180000);

        const opts = {
            path: '/',
            port: 4723,
            capabilities: {
                platformName: 'Android',
                automationName: 'UiAutomator2',
                deviceName: 'Samsung Galaxy S10',
                app: '/root/app/instagram.apk',
                appPackage: 'com.instagram.android',
                appActivity: 'com.instagram.mainactivity.MainActivity',
                noReset: false,
                newCommandTimeout: 90000
            }
        };

        try {
            driver = await webdriverio.remote(opts);
        } catch (error) {
            console.error('Failed to initialize driver:', error);
            throw error;
        }
    });

    after(async function() {
        if (driver) {
            await driver.deleteSession();
        }
    });

    it('should show error message for invalid credentials', async function() {
        this.timeout(120000);
        try {
            // Wait for app to load
            await driver.pause(5000);
            console.log('App loaded, looking for login button');

            // Click "Log In" button if there's a welcome screen
            try {
                const loginButton = await driver.$('~Log In');
                if (await loginButton.isDisplayed()) {
                    console.log('Login button found, clicking');
                    await loginButton.click();
                    await driver.pause(2000);
                }
            } catch (error) {
                console.log('Already on login screen or button not found');
            }

            // Enter invalid username
            console.log('Looking for username field');
            const usernameField = await driver.$('~Username');
            await usernameField.waitForDisplayed({ timeout: 10000 });
            await usernameField.click();
            await usernameField.setValue('invalid_username_test');
            console.log('Username entered');

            // Enter invalid password
            console.log('Looking for password field');
            const passwordField = await driver.$('~Password');
            await passwordField.waitForDisplayed({ timeout: 5000 });
            await passwordField.click();
            await passwordField.setValue('invalid_password_123');
            console.log('Password entered');

            // Click login button
            console.log('Looking for login submit button');
            const submitButton = await driver.$('~Log In');
            await submitButton.click();
            await driver.pause(3000);
            console.log('Login button clicked');

            // Verify error message
            console.log('Checking for error message');
            const errorMessage = await driver.$('//*[contains(@text, "incorrect")]');
            await errorMessage.waitForDisplayed({ timeout: 10000 });
            const isErrorDisplayed = await errorMessage.isDisplayed();
            assert.isTrue(isErrorDisplayed, 'Error message should be displayed for invalid credentials');

        } catch (error) {
            console.error('Test failed:', error);
            // Take screenshot on failure
            try {
                await driver.saveScreenshot('./error-screenshot.png');
            } catch (screenshotError) {
                console.error('Failed to take screenshot:', screenshotError);
            }
            throw error;
        }
    });
});
