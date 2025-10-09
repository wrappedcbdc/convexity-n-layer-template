import { render, cngn } from "@wrappedcbdc/emails";
const { PasswordReset } = cngn;

export const createPasswordResetTemplate = (data: { clientName: string; clientEmail: string; resetLink: string; companyName: string }) => {
    return render(PasswordReset({
        clientName: data.clientName,
        clientEmail: data.clientEmail,
        resetLink: data.resetLink,
        companyName: data.companyName,
    }));
};

export const createEnquiryTemplate = (data: { firstName?: string; lastName?: string; email?: string; phone?: string; country?: string; description?: string; }) => {
    return `
    <div style="padding: 10px; margin: 10px;">
      <p>${data?.firstName || ''} ${data?.lastName || ''}</p></br>
      <p>${data?.email || ''}</p></br>
      <p>${data?.phone || ''}</p></br>
      <p>${data?.country || ''}</p></br>
      <p>${data?.description || ''}</p></br>
    </div>
  `;
};

export const createNewAdminCredentialsTemplate = (data: { email: string; password: string; loginLink: string; }) => {
    return `
    <h1>An administrative account has been created for you on the WrapCBDC dashboard, login with credentials below</h1><br/>
    <h3>Email: ${data.email}</h3><br/>
    <h3>Password: ${data.password}</h3><br/>
    <span>Login link: ${data.loginLink}</span>
  `;
};

export const createMintFailedTemplate = (data: { amount: string; network: string; }) => {
    return `<h1>There was an issue minting the CNGN equivalent of #${data.amount} to your ${data.network.toUpperCase()} network wallet.</h1><br/>`;
};