import React, { ReactElement, useState, useEffect } from 'react'
import { LoggerInstance } from '@oceanprotocol/lib'
import { useAsset } from '@context/Asset'
import { useWeb3 } from '@context/Web3'
import styles from './index.module.css'
import Tabs from '@shared/atoms/Tabs'
import EditMetadata from './EditMetadata'
import EditComputeDataset from './EditComputeDataset'

export default function Edit({}): ReactElement {
  const { accountId } = useWeb3()
  const { asset } = useAsset()
  const [isCompute, setIsCompute] = useState(false)
  LoggerInstance.log('asset edit main = ', asset)
  LoggerInstance.log('accountId = ', accountId)

  // Switch type value upon tab change
  function handleTabChange(tabName: string) {
    LoggerInstance.log('switched to tab', tabName)
    // add store restore from
  }

  useEffect(() => {
    LoggerInstance.log('asset change ', asset)
    const isCompute = asset?.services[0]?.type === 'compute' ? true : false
    LoggerInstance.log('is compute ', isCompute)
    setIsCompute(isCompute)
  }, [asset])

  const tabs = [
    {
      title: 'Edit Metadata',
      content: <EditMetadata asset={asset}></EditMetadata>
    },
    {
      title: 'Edit Compute Settings',
      content: <EditComputeDataset asset={asset}></EditComputeDataset>,
      disabled: !isCompute
    }
  ].filter((tab) => tab !== undefined)

  return (
    <Tabs
      items={tabs}
      handleTabChange={handleTabChange}
      defaultIndex={0}
      className={styles.edit}
    />
  )
}
