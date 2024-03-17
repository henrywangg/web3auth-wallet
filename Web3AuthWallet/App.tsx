/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, { useEffect, useState } from 'react';
import type { PropsWithChildren } from 'react';
import {
  Button,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from 'react-native';

import {
  Colors,
  DebugInstructions,
  Header,
  LearnMoreLinks,
  ReloadInstructions,
} from 'react-native/Libraries/NewAppScreen';
import { authorize } from 'react-native-app-auth';
import { jwtDecode, JwtPayload } from 'jwt-decode';
import { LoginParams } from '@web3auth/single-factor-auth';
import { chainConfig, tKeyInstance } from './tkey';
import { EthereumPrivateKeyProvider } from '@web3auth/ethereum-provider';
import SfaServiceProvider from '@tkey/service-provider-sfa';
import SecurityQuestionsModule from '@tkey/security-questions';
import ReactNativeStorageModule from '@tkey/react-native-storage';

const config = {
  issuer: 'https://accounts.google.com',
  clientId:
    '1060816186506-3qs3gfgpg2iud0i2l9g86ijojl9himsj.apps.googleusercontent.com',
  redirectUrl: 'com.web3authwallet:/oauth2callback',
  scopes: ['openid', 'profile', 'email'],
};

type SectionProps = PropsWithChildren<{
  title: string;
}>;

interface CustomJwtPayload extends JwtPayload {
  email: string;
}

function Section({ children, title }: SectionProps): React.JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';
  return (
    <View style={styles.sectionContainer}>
      <Text
        style={[
          styles.sectionTitle,
          {
            color: isDarkMode ? Colors.white : Colors.black,
          },
        ]}>
        {title}
      </Text>
      <Text
        style={[
          styles.sectionDescription,
          {
            color: isDarkMode ? Colors.light : Colors.dark,
          },
        ]}>
        {children}
      </Text>
    </View>
  );
}

const ethereumPrivateKeyProvider = new EthereumPrivateKeyProvider({
  config: {
    chainConfig,
  },
});

function App(): React.JSX.Element {
  const [isLogined, setIsLogined] = useState<boolean>(false)

  useEffect(() => {
    const init = async () => {
      // Initialization of Service Provider
      try {
        await (tKeyInstance.serviceProvider as any).init(ethereumPrivateKeyProvider)
        console.log('tKeyInstance', tKeyInstance)
      } catch (error) {
        console.error('error', error)
      }
    };
    init()
  }, [])

  const isDarkMode = useColorScheme() === 'dark';

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  const loginHandler = async () => {
    try {
      const result = await authorize(config)

      // OAuth Info
      const idToken = result.idToken
      const decodedToken: CustomJwtPayload = jwtDecode(idToken)
      console.log(decodedToken)
      const loginParams: LoginParams = {
        verifier: 'web3auth-wallet-demo',
        verifierId: decodedToken['email']?.toString() || decodedToken['sub']?.toString() || '',
        idToken: idToken,
      }

      // Web3Auth config
      const OAuthShareKey = await (tKeyInstance.serviceProvider as SfaServiceProvider).connect(loginParams)
      console.log("OAuth Share:", OAuthShareKey)

      if (OAuthShareKey) {
        await tKeyInstance.initialize()
        setIsLogined(true)
      }
    } catch (ex) {
      console.log('ex', ex)
    }
  }

  const tKeyDetailsHandler = async () => {
    const keyDetails = tKeyInstance.getKeyDetails()
    console.log(keyDetails)
  }

  const deviceShareHandler = async () => {
    const generateShareResult = await tKeyInstance.generateNewShare()
    const share = tKeyInstance.outputShareStore(generateShareResult.newShareIndex)
    try {
      await (tKeyInstance.modules.reactNativeStorage as ReactNativeStorageModule).storeDeviceShare(share)
      console.log('Device Share Set', JSON.stringify(share))
    } catch (error) {
      recoveryShare()
    }
  }

  const createDemoSecurityQuestionShareHandler = async () => {
    tKeyInstance.modules.securityQuestions.initialize()
    // const shareStore = await tKeyInstance.generateNewShare();
    // console.log(shareStore)
    await (tKeyInstance.modules.securityQuestions as any).generateNewShareWithSecurityQuestions('1234567', 'whats your password?')
  }

  //congress elite hat traffic coast term grain ten answer acquire popular banana
  // const generateNewShareForFirstLogin = async () => {
  //   await (tKeyInstance.modules.seedPhrase as any).setSeedPhrase()
  // }

  const recoveryShare = async () => {
    await (tKeyInstance.modules.securityQuestions as any).inputShareFromSecurityQuestions('1234567')
    //await tKeyInstance.reconstructKey();
    // const shareStore = await tKeyInstance.generateNewShare();
    // console.log(shareStore)
    // await (tKeyInstance.modules.reactNativeStorage as ReactNativeStorageModule).storeDeviceShare(shareStore.newShareStores[1])
  }

  const reconstructPrivateKeyHandler = async () => {
    const reconstructedKeyResult = await tKeyInstance.reconstructKey();
    const privateKey = reconstructedKeyResult?.privKey.toString('hex');
    console.log("Private Key: ", privateKey);
  }

  return (
    <SafeAreaView style={backgroundStyle}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={backgroundStyle.backgroundColor}
      />
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        style={backgroundStyle}>
        <Header />
        <View
          style={{
            backgroundColor: isDarkMode ? Colors.black : Colors.white,
          }}>
          <Section title="Step One">
            <View>
              {!isLogined && <Button title="Login (Share A)" onPress={loginHandler} />}
              {isLogined && <Button title="Create Demo Security Question Share (Share C)" onPress={createDemoSecurityQuestionShareHandler} />}
              {/* {isLogined && <Button title="Set Device Share" onPress={deviceShareHandler} />} */}
              {isLogined && <Button title="Recovery Share C" onPress={recoveryShare} />}
              {isLogined && <Button title="Get TKey Details" onPress={tKeyDetailsHandler} />}
              {isLogined && <Button title="Reconstruct Private Key" onPress={reconstructPrivateKeyHandler} />}
            </View>
          </Section>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
  },
  highlight: {
    fontWeight: '700',
  },
});

export default App;
