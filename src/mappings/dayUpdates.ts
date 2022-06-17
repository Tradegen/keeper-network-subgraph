import { BigInt, ethereum } from "@graphprotocol/graph-ts";
import {
  KeeperRegistry,
  KeeperDayData,
  KeeperRegistryDayData,
} from "../types/schema";
import {
  KEEPER_REGISTRY_ADDRESS,
  ZERO_BI } from "./helpers";

export function updateKeeperRegistryDayData(event: ethereum.Event): KeeperRegistryDayData {
  let keeperRegistry = KeeperRegistry.load(KEEPER_REGISTRY_ADDRESS);
  let timestamp = event.block.timestamp.toI32();
  let dayID = timestamp / 86400;
  let dayStartTimestamp = dayID * 86400;
  let keeperRegistryDayData = KeeperRegistryDayData.load(dayID.toString());
  if (keeperRegistryDayData === null)
  {
    keeperRegistryDayData = new KeeperRegistryDayData(dayID.toString());
    keeperRegistryDayData.date = dayStartTimestamp;
    keeperRegistryDayData.dailyRevenue = ZERO_BI;
    keeperRegistryDayData.totalRevenue = ZERO_BI;
    keeperRegistryDayData.dailyTxns = 0;
    keeperRegistryDayData.dailyUpkeepsPerformed = 0;
    keeperRegistryDayData.totalUpkeepsPerformed = 0;
    keeperRegistryDayData.dailyKeepersRegistered = 0;
    keeperRegistryDayData.totalKeepersRegistered = 0;
    keeperRegistryDayData.dailyJobsCreated = 0;
    keeperRegistryDayData.totalJobsCreated = 0;
  }

  keeperRegistryDayData.totalRevenue = keeperRegistry.totalRevenue;
  keeperRegistryDayData.dailyTxns = keeperRegistryDayData.dailyTxns + 1;
  keeperRegistryDayData.totalUpkeepsPerformed = keeperRegistry.totalUpkeepsPerformed;
  keeperRegistryDayData.totalKeepersRegistered = keeperRegistry.keeperCount;
  keeperRegistryDayData.totalJobsCreated = keeperRegistry.jobCount;
  keeperRegistryDayData.save();

  return keeperRegistryDayData as KeeperRegistryDayData;
}

export function updateKeeperDayData(event: ethereum.Event, fee: BigInt): KeeperDayData {
  let timestamp = event.block.timestamp.toI32();
  let dayID = timestamp / 86400;
  let dayStartTimestamp = dayID * 86400;
  let dayKeeperID = event.address
    .toHexString()
    .concat("-")
    .concat(BigInt.fromI32(dayID).toString());
  let keeperDayData = KeeperDayData.load(dayKeeperID);
  if (keeperDayData === null) {
    keeperDayData = new KeeperDayData(dayKeeperID);
    keeperDayData.date = dayStartTimestamp;
    keeperDayData.dailyRevenue = ZERO_BI;
    keeperDayData.dailyTxns = 0;
    keeperDayData.dailyUpkeepsPerformed = 0;
  }

  keeperDayData.dailyRevenue = keeperDayData.dailyRevenue.plus(fee);
  keeperDayData.dailyTxns = keeperDayData.dailyTxns + 1;
  keeperDayData.dailyUpkeepsPerformed = keeperDayData.dailyUpkeepsPerformed + 1;
  keeperDayData.save();

  return keeperDayData as KeeperDayData;
}