const { remote } = require('webdriverio');
const { assert } = require('chai');

describe('Instagram Login Tests', function() {
    let driver;

    before(async function() {
        this.timeout(180000);

        const capabilities = {
            platformName: 'Android',
            'appium:automationName': 'UiAutomator2',
            'appium:deviceName': 'nexus_5_12.0',
            'appium:avd': 'nexus_5_12.0',
            'appium:app': '/root/app/instagram.apk',
            'appium:appPackage': 'com.instagram.android',
            'appium:appActivity': 'com.instagram.mainactivity.MainActivity',
            'appium:noReset': false,
            'appium:newCommandTimeout': 90000,
            'appium:androidDeviceReadyTimeout': 90000,
            'appium:avdLaunchTimeout': 90000,
            'appium:avdReadyTimeout': 90000,
            'appium:autoGrantPermissions': true,
            'appium:adbExecTimeout': 120000,
            'appium:androidInstallTimeout': 90000
        };

        driver = await remote({
            protocol: 'http',
            hostname: 'localhost',
            port: 4723,
            path: '/',
            capabilities: capabilities,
            waitforTimeout: 30000,
            connectionRetryTimeout: 120000,
            connectionRetryCount: 3,
            logLevel: 'debug'
        });
    });

    after(async function() {
        if (driver) {
            await driver.deleteSession();
        }
    });

    it('should show error message for invalid credentials', async function() {
        this.timeout(120000);
        
        try {
            console.log('Waiting for app to load...');
            await driver.pause(5000);

            console.log('Checking for login button...');
            try {
                const loginButton = await driver.$('android=new UiSelector().text("Log In")');
                if (await loginButton.isDisplayed()) {
                    console.log('Login button found, clicking...');
                    await loginButton.click();
                    await driver.pause(2000);
                }
            } catch (error) {
                console.log('Already on login screen or error finding login button');
            }

            console.log('Entering username...');
            const usernameField = await driver.$('android=new UiSelector().text("Username")');
            await usernameField.waitForDisplayed({ timeout: 20000 });
            await usernameField.click();
            await usernameField.setValue('invalid_username_test');

            console.log('Entering password...');
            const passwordField = await driver.$('android=new UiSelector().text("Password")');
            await passwordField.waitForDisplayed({ timeout: 10000 });
            await passwordField.click();
            await passwordField.setValue('invalid_password_123');

            console.log('Clicking login button...');
            const submitButton = await driver.$('android=new UiSelector().text("Log In").className("android.widget.Button")');
            await submitButton.click();
            await driver.pause(5000);

            console.log('Checking for error message...');
            const errorMessage = await driver.$('android=new UiSelector().textContains("incorrect")');
            await errorMessage.waitForDisplayed({ timeout: 20000 });
            const isErrorDisplayed = await errorMessage.isDisplayed();
            assert.isTrue(isErrorDisplayed, 'Error message should be displayed for invalid credentials');

        } catch (error) {
            console.error('Test failed:', error);
            await driver.saveScreenshot('./error-screenshot.png');
            throw error;
        }
    });
});