import React, {
  useContext,
  useState,
  useEffect,
  createContext,
  ReactElement,
  ReactNode,
  useCallback
} from 'react'
import { DDO, Logger } from '@oceanprotocol/lib'
import { PoolStatus as MigrationPoolStatus, Migration } from 'v4-migration-lib' // currently using npm link
import appConfig from '../../app.config'
import { useWeb3 } from './Web3'
import { useAsset } from './Asset'
Logger.log('[Migration] Migration provider called')

interface MigrationProviderValue {
  migrationAddress: string
  status: string
  poolV3Address: string
  poolV4Address: string
  didV3: string
  didV4: string
  owner: string
  poolShareOwners: string[]
  dtV3Address: string
  totalOcean: string
  totalDTBurnt: string
  newLPTAmount: string
  lptRounding: string
  deadline: string
  refreshMigrationStatus: (
    poolAddressV3: string,
    migrationAddress: string
  ) => Promise<void>
}

const MigrationContext = createContext({} as MigrationProviderValue)

function MigrationProvider({
  children
}: {
  children: ReactNode
}): ReactElement {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>()
  const [migrationAddress, setMigrationAddress] = useState<string>()
  const [status, setStatus] = useState<string>()
  const [poolV3Address, setPoolV3Address] = useState<string>()
  const [poolV4Address, setPoolV4Address] = useState<string>()
  const [didV3, setDidV3] = useState<string>()
  const [didV4, setDidV4] = useState<string>()
  const [owner, setOwner] = useState<string>()
  const [poolShareOwners, setPoolShareOwners] = useState<string[]>()
  const [dtV3Address, setDtV3Address] = useState<string>()
  const [totalOcean, setTotalOcean] = useState<string>()
  const [totalDTBurnt, setTotalDTBurnt] = useState<string>()
  const [newLPTAmount, setNewLPTAmount] = useState<string>()
  const [lptRounding, setLptRounding] = useState<string>()
  const [deadline, setDeadline] = useState<string>()
  const { chainId } = useWeb3()
  const { price } = useAsset()
  const { web3 } = useWeb3()

  async function switchMigrationAddress(chainId: number): Promise<void> {
    switch (chainId) {
      case 1:
        setMigrationAddress(appConfig.ethereumMigrationContractAddresss)
        break
      case 137:
        setMigrationAddress(appConfig.polygonMigrationContractAddresss)
        break
      case 56:
        setMigrationAddress(appConfig.bscMigrationContractAddresss)
        break
      case 1285:
        setMigrationAddress(appConfig.moonriverMigrationContractAddresss)
        break
      case 246:
        setMigrationAddress(appConfig.ewcMigrationContractAddresss)
        break
      case 4:
        setMigrationAddress(appConfig.rinkebyMigrationContractAddresss)
        break
      default:
        break
    }
  }

  async function fetchMigrationStatus(
    poolAddressV3: string,
    migrationAddress: string
  ): Promise<MigrationPoolStatus> {
    Logger.log('[Migration] Fetching migration status')
    setLoading(true)
    const migration = new Migration(web3)
    if (migration === undefined) {
      Logger.error('[Migration] Migration not initiated')
    }
    let status
    try {
      status = await migration.getPoolStatus(migrationAddress, poolAddressV3)
    } catch (error) {
      Logger.error('[Migration] migration.getPoolStatus ERROR: ', error)
    }
    Logger.log('[Migration] status: ', status)
    Logger.log('[Migration] status.status: ', status.status)
    if (!status) {
      setError(
        `No migration status was found for asset with poolAddress ${poolAddressV3} on network with chainId ${chainId} in migration contract with address ${migrationAddress}`
      )
    } else {
      setError(undefined)
    }
    setLoading(false)
    return status
  }

  const refreshMigrationStatus = async (
    poolAddressV3: string,
    migrationAddress: string
  ) => {
    setLoading(true)
    const status = await fetchMigrationStatus(poolAddressV3, migrationAddress)
    Logger.log('[migration] Got Migration Status', status.status)
    setStatus(status.status)
    setLoading(false)
  }

  // const initMigrationStatus = useCallback(async (ddo: DDO): Promise<void> => {
  //   if (!ddo) return
  //   setLoading(true)
  //   const returnedPrice = await getPrice(ddo)
  //   setPrice({ ...returnedPrice })

  //   // Get metadata from DDO
  //   const { attributes } = ddo.findServiceByType('metadata')
  //   setMetadata(attributes as unknown as MetadataMarket)
  //   setTitle(attributes?.main.name)
  //   setType(attributes.main.type)
  //   setOwner(ddo.publicKey[0].owner)
  //   Logger.log('[asset] Got Metadata from DDO', attributes)

  //   setIsInPurgatory(ddo.isInPurgatory === 'true')
  //   await setPurgatory(ddo.id)
  //   setLoading(false)
  // }, [])

  useEffect(() => {
    async function init() {
      await switchMigrationAddress(chainId)
      let status
      try {
        console.log(
          'Calling fetchMigrationStatus :',
          price.address,
          migrationAddress
        )
        status = await fetchMigrationStatus(price.address, migrationAddress)
        Logger.log('[Migration] status 1', status)
      } catch (error) {
        Logger.log('[Migration] fetchMigrationStatus ERROR', error)
      }
      Logger.log('[Migration] status 2', status)

      setStatus(status.status)
      setPoolV3Address(status.poolV3Address)
      setPoolV4Address(status.poolV4Address)
      setDidV3(status.didV3)
      setDidV4(status.didV4)
      setOwner(status.owner)
      setPoolShareOwners(status.poolShareOwners)
      setDtV3Address(status.dtV3Address)
      setTotalOcean(status.totalOcean)
      setTotalDTBurnt(status.totalDTBurnt)
      setNewLPTAmount(status.newLPTAmount)
      setLptRounding(status.lptRounding)
      setDeadline(status.deadline)
    }
    init()
  }, [chainId, migrationAddress, price])
  return (
    <MigrationContext.Provider
      value={
        {
          migrationAddress,
          status,
          poolV3Address,
          poolV4Address,
          didV3,
          didV4,
          owner,
          poolShareOwners,
          dtV3Address,
          totalOcean,
          totalDTBurnt,
          newLPTAmount,
          lptRounding,
          deadline,
          refreshMigrationStatus
        } as MigrationProviderValue
      }
    >
      {children}
    </MigrationContext.Provider>
  )
}
// Helper hook to access the provider values
const useMigrationStatus = (): MigrationProviderValue =>
  useContext(MigrationContext)

export {
  MigrationProvider,
  useMigrationStatus,
  MigrationProviderValue,
  MigrationContext
}
export default MigrationProvider
