/**
 * Mock SMS Provider for local development & testing
 */
export class MockSmsProvider {
  async sendOtp(phoneNumber, otp) {
    console.log(`[MOCK SMS] OTP for ${phoneNumber} is ${otp}`);
    return {
      success: true,
      messageId: `mock_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
    };
  }
}

/**
 * Twilio SMS Provider Implementation
 */
export class TwilioSmsProvider {
  constructor(accountSid, authToken, fromPhone) {
    this.accountSid = accountSid;
    this.authToken = authToken;
    this.fromPhone = fromPhone;
  }

  async sendOtp(phoneNumber, otp) {
    try {
      const url = `https://api.twilio.com/2010-04-01/Accounts/${this.accountSid}/Messages.json`;
      const body = new URLSearchParams({
        To: phoneNumber,
        From: this.fromPhone,
        Body: `Your TharaniTex verification code is ${otp}. Valid for 5 minutes.`,
      });

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Basic ${btoa(`${this.accountSid}:${this.authToken}`)}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: body.toString(),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        return { success: false, error: data.message || 'Twilio SMS send failed' };
      }

      return { success: true, messageId: data.sid };
    } catch (err) {
      return { success: false, error: err.message || 'Twilio network error' };
    }
  }
}

/**
 * MSG91 SMS Provider Implementation
 */
export class Msg91SmsProvider {
  constructor(authKey, templateId) {
    this.authKey = authKey;
    this.templateId = templateId;
  }

  async sendOtp(phoneNumber, otp) {
    try {
      const formattedPhone = phoneNumber.replace(/[^0-9]/g, '');
      const url = `https://control.msg91.com/api/v5/otp?template_id=${this.templateId}&mobile=${formattedPhone}&otp=${otp}`;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          authkey: this.authKey,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json().catch(() => ({}));

      if (data.type !== 'success') {
        return { success: false, error: data.message || 'MSG91 SMS send failed' };
      }

      return { success: true, messageId: data.request_id };
    } catch (err) {
      return { success: false, error: err.message || 'MSG91 network error' };
    }
  }
}

/**
 * Textlocal SMS Provider Implementation
 */
export class TextlocalSmsProvider {
  constructor(apiKey, sender = 'TXTLCL') {
    this.apiKey = apiKey;
    this.sender = sender;
  }

  async sendOtp(phoneNumber, otp) {
    try {
      const url = 'https://api.textlocal.in/send/';
      const body = new URLSearchParams({
        apiKey: this.apiKey,
        numbers: phoneNumber.replace(/[^0-9]/g, ''),
        sender: this.sender,
        message: `Your TharaniTex verification code is ${otp}. Valid for 5 minutes.`,
      });

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: body.toString(),
      });

      const data = await response.json().catch(() => ({}));

      if (data.status !== 'success') {
        return { success: false, error: data.errors?.[0]?.message || 'Textlocal SMS send failed' };
      }

      return { success: true, messageId: String(data.batch_id) };
    } catch (err) {
      return { success: false, error: err.message || 'Textlocal network error' };
    }
  }
}

/**
 * Factory function to instantiate the active SMS provider based on environment variables
 */
export function getSmsProvider(env) {
  const provider = env?.SMS_PROVIDER || process.env.SMS_PROVIDER || 'mock';

  switch (provider) {
    case 'twilio': {
      const accountSid = env?.TWILIO_ACCOUNT_SID || process.env.TWILIO_ACCOUNT_SID;
      const authToken = env?.TWILIO_AUTH_TOKEN || process.env.TWILIO_AUTH_TOKEN;
      const fromPhone = env?.TWILIO_FROM_PHONE || process.env.TWILIO_FROM_PHONE;
      if (accountSid && authToken && fromPhone) {
        return new TwilioSmsProvider(accountSid, authToken, fromPhone);
      }
      break;
    }

    case 'msg91': {
      const authKey = env?.MSG91_AUTH_KEY || process.env.MSG91_AUTH_KEY;
      const templateId = env?.MSG91_TEMPLATE_ID || process.env.MSG91_TEMPLATE_ID;
      if (authKey && templateId) {
        return new Msg91SmsProvider(authKey, templateId);
      }
      break;
    }

    case 'textlocal': {
      const apiKey = env?.TEXTLOCAL_API_KEY || process.env.TEXTLOCAL_API_KEY;
      const sender = env?.TEXTLOCAL_SENDER || process.env.TEXTLOCAL_SENDER || 'TXTLCL';
      if (apiKey) {
        return new TextlocalSmsProvider(apiKey, sender);
      }
      break;
    }
  }

  // Fallback to Mock provider for local environment / missing credentials
  return new MockSmsProvider();
}
