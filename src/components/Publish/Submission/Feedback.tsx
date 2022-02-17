import { useFormikContext } from 'formik'
import React, { ReactElement, useEffect, useState } from 'react'
import { FormPublishData } from '../_types'
import { getFeesTokensAndPricing } from '../_utils'
import { useWeb3 } from '@context/Web3'
import styles from './Feedback.module.css'
import TransactionCount from './TransactionCount'
import GasFees from './GasFees'
import useNftFactory from '@hooks/contracts/useNftFactory'
import { NftFactory, LoggerInstance } from '@oceanprotocol/lib'
import { getOceanConfig } from '@utils/ocean'

import Web3 from 'web3'

export function Feedback(): ReactElement {
  const { values } = useFormikContext<FormPublishData>()
  const nftFactory = useNftFactory()
  const [gasFeeToken, setGasFeeToken] = useState('')
  const [gasFeeDDO, setGasFeeDDO] = useState('')
  const { web3, chainId } = useWeb3()

  const getEstGasFeeToken = async (
    values: FormPublishData,
    accountId: string,
    nftFactory: NftFactory,
    web3: Web3
  ): Promise<string> => {
    if (!nftFactory) return

    const config = getOceanConfig(chainId)
    LoggerInstance.log('[gas fee] using config: ', config)

    const result = await getFeesTokensAndPricing(
      values,
      accountId,
      config,
      nftFactory,
      web3
    )

    LoggerInstance.log('[gas fee] createTokensAndPricing tx', result)
    console.log(result)

    return result
  }

  const getEstGasFeeDDO = async (
    values: FormPublishData,
    accountId: string,
    nftFactory: NftFactory,
    web3: Web3
  ): Promise<string> => {
    if (!nftFactory) return

    const config = getOceanConfig(chainId)
    LoggerInstance.log('[gas fee] using config: ', config)

    const result = await getFeesTokensAndPricing(
      values,
      accountId,
      config,
      nftFactory,
      web3
    )

    LoggerInstance.log('[gas fee] createTokensAndPricing tx', result)
    console.log(result)

    return result
  }

  useEffect(() => {
    console.log(values)
  }, [values, nftFactory])

  const items = Object.entries(values.feedback).map(([key, value], index) => (
    <li key={index} className={styles[value.status]}>
      <h3 className={styles.title}>
        {value.name}
        {value.txCount > 0 && (
          <TransactionCount
            txCount={value.txCount}
            chainId={values.user.chainId}
            txHash={value.txHash}
          />
        )}
        {value.txCount > 0 && gasFeeToken && index === 0 && (
          <GasFees gasFees={gasFeeToken} />
        )}
        {value.txCount > 0 && gasFeeDDO && index === 2 && (
          <GasFees gasFees={gasFeeDDO} />
        )}
      </h3>
      <p className={styles.description}>{value.description}</p>
      {value.errorMessage && (
        <span className={styles.errorMessage}>{value.errorMessage}</span>
      )}
    </li>
  ))

  return <ol className={styles.feedback}>{items}</ol>
}
