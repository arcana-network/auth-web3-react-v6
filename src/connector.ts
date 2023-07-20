import { AbstractConnector } from "@web3-react/abstract-connector";
import { ConnectorUpdate } from "@web3-react/types";
import type { AuthProvider, EthereumProvider } from "@arcana/auth";

interface LoginType {
  provider: string;
  email?: string;
}

export class ArcanaConnector extends AbstractConnector {
  readonly id = "arcana";
  readonly name = "Arcana Auth";
  private auth: AuthProvider;
  private login?: LoginType;
  private chainId: number;
  private attached = false;

  constructor(
    auth: AuthProvider,
    { chainId, login }: { login?: LoginType; chainId: number }
  ) {
    super({ supportedChainIds: [chainId] });
    this.chainId = chainId;
    this.auth = auth;
    this.login = login;
    this.addListeners();
  }

  setLogin(login: LoginType) {
    this.login = login;
  }

  private disconnectListener = () => {
    this.emitDeactivate();
  };

  private chainChangedListener = (chainId: string): void => {
    this.emitUpdate({ chainId });
  };

  // private accountsChangedListener = (accounts: string[]): void => {
  //   this.emitUpdate({ account: accounts[0] });
  // };

  public async connectEagerly(): Promise<void> {
    this.addListeners();
    await this.auth.init();
    if (await this.auth.isLoggedIn()) {
      if (!this.auth.connected) {
        await new Promise((resolve) =>
          this.auth.provider.on("connect", resolve)
        );
      }
    }
    return;
  }

  private addListeners() {
    if (!this.attached) {
      this.attached = true;
      // this.auth.provider.on("connect", this.connectListener);
      this.auth.provider.on("disconnect", this.disconnectListener);
      this.auth.provider.on("chainChanged", this.chainChangedListener);
    }
  }
  private removeListeners() {
    if (this.attached) {
      // this.auth.provider.removeListener("connect", this.connectListener);
      this.auth.provider.removeListener("disconnect", this.disconnectListener);
      this.auth.provider.removeListener(
        "chainChanged",
        this.chainChangedListener
      );
      this.attached = false;
    }
  }

  async activate(): Promise<ConnectorUpdate> {
    this.addListeners();
    let provider: EthereumProvider | undefined;
    await this.auth.init();
    if (await this.auth.isLoggedIn()) {
      if (!this.auth.connected) {
        await new Promise((resolve) =>
          this.auth.provider.on("connect", resolve)
        );
      }
      // return;
    } else {
      if (this.login) {
        if (this.login.provider === "passwordless") {
          if (this.login.email) {
            provider = await this.auth.loginWithLink(this.login.email);
          } else {
            throw new Error("email is required for passwordless login");
          }
        } else {
          provider = await this.auth.loginWithSocial(this.login.provider);
        }
      } else {
        provider = await this.auth.connect();
      }
    }
    // const provider =
    // .then((provider: EthereumProvider) => {
    const accounts = (await provider?.request({
      method: "eth_accounts",
    })) as string[];
    return { provider: this.auth.provider, account: accounts[0] };
    // });
  }
  public async getProvider(): Promise<any> {
    return this.auth.provider;
  }

  public async getAccount() {
    const accounts = (await this.auth.provider.request({
      method: "eth_accounts",
    })) as string[];
    return accounts[0];
  }

  public async getChainId(): Promise<number | string> {
    return this.chainId;
  }

  public async deactivate(): Promise<void> {
    await this.auth.logout();
    this.removeListeners();
  }

  public async close() {
    this.emitDeactivate();
  }
}
