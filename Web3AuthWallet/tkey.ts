import ThresholdKey from '@tkey/core';
import SFAServiceProvider from '@tkey/service-provider-sfa';
import TorusStorageLayer from '@tkey/storage-layer-torus';
import { ShareSerializationModule } from '@tkey/share-serialization';
import { ReactNativeStorageModule } from '@tkey/react-native-storage';
import EncryptedStorage from 'react-native-encrypted-storage';
import SecurityQuestionsModule from '@tkey/security-questions';
import { SeedPhraseModule } from '@tkey/seed-phrase';

const clientId =
  'BIjddnt1mkbQeEw3FrNXWF7Zkwd7lX4b72akij45N9eL0DPSKCZyy4QjJmrPDTo8NW8Xoo70hw560i70zzOsdZk'; // get from https://dashboard.web3auth.io

export const chainConfig = {
  chainId: '0x5',
  rpcTarget: 'https://rpc.ankr.com/eth_goerli',
  displayName: 'Ethereum Goerli Testnet',
  blockExplorer: 'https://etherscan.io/',
  ticker: 'ETH',
  tickerName: 'Ethereum',
};

const web3AuthOptions: any = {
  clientId, // Get your Client ID from Web3Auth Dashboard
  chainConfig,
  web3AuthNetwork: 'sapphire_devnet',
};

// Configuration of Service Provider
const serviceProvider = new SFAServiceProvider({ web3AuthOptions });

// Instantiation of Storage Layer
const storageLayer = new TorusStorageLayer({
  hostUrl: 'https://metadata.tor.us',
});

// Configuration of Modules
const reactNativeStorageModule = new ReactNativeStorageModule(EncryptedStorage);
const securityQuestionsModule = new SecurityQuestionsModule();
const shareSerializationModule = new ShareSerializationModule();
//const seedPhraseModule = new SeedPhraseModule([])

// Instantiation of tKey
export const tKeyInstance = new ThresholdKey({
  serviceProvider,
  storageLayer,
  modules: {
    reactNativeStorage: reactNativeStorageModule,
    shareSerialization: shareSerializationModule,
    securityQuestions: securityQuestionsModule,
    //seedPhrase: seedPhraseModule
  },
});