import {
  KeeperRegistry,
  Job,
  Payee,
  JobOwner,
  Keeper,
  Update
} from "../types/schema";
import {
  AddedFunds,
  WithdrewFunds,
  UpdatedPayee,
  ClaimedFees,
  CanceledJob,
  ChargedFee,
  UpdatedKeeperFee,
  RegisteredKeeper,
  CreatedJob,
  UpdatedDedicatedCaller
} from "../types/KeeperRegistry/KeeperRegistry";
import {
  updateKeeperDayData,
  updateKeeperRegistryDayData,
} from "./dayUpdates";
import {
  KEEPER_REGISTRY_ADDRESS,
  ZERO_BI
} from "./helpers";

export function handleAddedFunds(event: AddedFunds): void {
    // Update global values.
    let keeperRegistry = KeeperRegistry.load(KEEPER_REGISTRY_ADDRESS);
    keeperRegistry.txCount = keeperRegistry.txCount + 1;
    keeperRegistry.save();

    let job = Job.load(event.params.jobID.toString());
    job.availableFunds = job?.availableFunds.plus(event.params.amount);
    job.save();

    updateKeeperRegistryDayData(event);
}

export function handleWithdrewFunds(event: WithdrewFunds): void {
    // Update global values.
    let keeperRegistry = KeeperRegistry.load(KEEPER_REGISTRY_ADDRESS);
    keeperRegistry.txCount = keeperRegistry.txCount + 1;
    keeperRegistry.save();

    let job = Job.load(event.params.jobID.toString());
    job.availableFunds = job?.availableFunds.minus(event.params.amount);
    job.save();

    updateKeeperRegistryDayData(event);
}

export function handleUpdatedPayee(event: UpdatedPayee): void {
    // Update global values.
    let keeperRegistry = KeeperRegistry.load(KEEPER_REGISTRY_ADDRESS);
    keeperRegistry.txCount = keeperRegistry.txCount + 1;
    keeperRegistry.save();

    // Create the payee.
    let payee = Payee.load(event.params.newPayee.toHexString());
    if (payee === null)
    {
        payee = new Payee(event.params.newPayee.toHexString());
        payee.collectedFees = ZERO_BI;
    }

    payee.save();

    let keeper = Keeper.load(event.params.keeper.toHexString());
    keeper.payee = event.params.newPayee.toHexString();
    keeper.save();

    updateKeeperRegistryDayData(event);
}

export function handleClaimedFees(event: ClaimedFees): void {
    // Update global values.
    let keeperRegistry = KeeperRegistry.load(KEEPER_REGISTRY_ADDRESS);
    keeperRegistry.txCount = keeperRegistry.txCount + 1;
    keeperRegistry.save();

    let payee  =Payee.load(event.params.payee.toHexString());
    payee.collectedFees = payee.collectedFees.plus(event.params.amount);
    payee.save();

    updateKeeperRegistryDayData(event);
}

export function handleCanceledJob(event: CanceledJob): void {
    // Update global values.
    let keeperRegistry = KeeperRegistry.load(KEEPER_REGISTRY_ADDRESS);
    keeperRegistry.txCount = keeperRegistry.txCount + 1;
    keeperRegistry.save();

    let job = Job.load(event.params.jobID.toString());
    job.keeper = "";
    job.availableFunds = 0;
    job.owner = "";
    job.save();

    updateKeeperRegistryDayData(event);
}

export function handleChargedFee(event: ChargedFee): void {
    // Update global values.
    let keeperRegistry = KeeperRegistry.load(KEEPER_REGISTRY_ADDRESS);
    keeperRegistry.txCount = keeperRegistry.txCount + 1;
    keeperRegistry.totalUpkeepsPerformed = keeperRegistry.totalUpkeepsPerformed + 1;
    keeperRegistry.totalRevenue = keeperRegistry.totalRevenue.plus(event.params.amount);
    keeperRegistry.save();

    let job = Job.load(event.params.jobID.toString());
    job.availableFunds = job.availableFunds.minus(event.params.amount);
    job.numberOfUpdates = job.numberOfUpdates + 1;
    job.lastUpdated = event.block.timestamp;
    job.feesPaid = job.feesPaid.plus(event.params.amount);
    job?.save();

    let payee = Payee.load(event.params.payee.toHexString());
    payee.collectedFees = payee.collectedFees.plus(event.params.amount);
    payee.save();

    let jobOwner = JobOwner.load(job.owner);
    jobOwner.feesPaid = jobOwner.feesPaid.plus(event.params.amount);
    jobOwner.save();

    let keeper = Keeper.load(job.keeper);
    keeper.collectedFees = keeper.collectedFees.plus(event.params.amount);
    keeper.numberOfUpdates = keeper.numberOfUpdates + 1;
    keeper.save();

    let update = new Update(event.transaction.hash.toHexString());
    update.job = event.params.jobID.toString();
    update.keeper = job.keeper;
    update.timestamp = event.block.timestamp;
    update.feePaid = event.params.amount;
    update.save();

    let keeperRegistryDayData = updateKeeperRegistryDayData(event);
    keeperRegistryDayData.dailyUpkeepsPerformed = keeperRegistryDayData.dailyUpkeepsPerformed + 1;
    keeperRegistryDayData.dailyRevenue = keeperRegistryDayData.dailyRevenue.plus(event.params.amount);
    keeperRegistryDayData.save();

    updateKeeperDayData(event, event.params.amount);
}

export function handleUpdatedKeeperFee(event: UpdatedKeeperFee): void {
    // Update global values.
    let keeperRegistry = KeeperRegistry.load(KEEPER_REGISTRY_ADDRESS);
    keeperRegistry.txCount = keeperRegistry.txCount + 1;
    keeperRegistry.save();

    let keeper = Keeper.load(event.params.keeper.toHexString());
    keeper.fee = event.params.newFee;
    keeper.save();

    updateKeeperRegistryDayData(event);
}

export function handlerRegisteredKeeper(event: RegisteredKeeper): void {
    // Update global values.
    let keeperRegistry = KeeperRegistry.load(KEEPER_REGISTRY_ADDRESS);
    if (keeperRegistry === null) 
    {
        keeperRegistry = new KeeperRegistry(KEEPER_REGISTRY_ADDRESS);
        keeperRegistry.keeperCount = 0;
        keeperRegistry.jobCount = 0;
        keeperRegistry.totalRevenue = ZERO_BI;
        keeperRegistry.totalUpkeepsPerformed = 0;
        keeperRegistry.txCount = 0;
    }

    keeperRegistry.txCount = keeperRegistry.txCount + 1;
    keeperRegistry.keeperCount = keeperRegistry.keeperCount + 1;
    keeperRegistry.save();

    // Create the payee.
    let payee = Payee.load(event.params.payee.toHexString());
    if (payee === null)
    {
        payee = new Payee(event.params.payee.toHexString());
        payee.collectedFees = ZERO_BI;
    }

    payee.save();

    let keeper = new Keeper(event.params.keeper.toHexString());
    keeper.owner = event.params.owner.toHexString();
    keeper.fee = event.params.fee;
    keeper.payee = event.params.payee.toHexString();
    keeper.collectedFees = ZERO_BI;
    keeper.dedicatedCaller = event.params.dedicatedCaller.toHexString();
    keeper.numberOfUpdates = 0;
    keeper.createdOn = event.block.timestamp;
    keeper.save();

    let keeperRegistryDayData = updateKeeperRegistryDayData(event);
    keeperRegistryDayData.dailyKeepersRegistered = keeperRegistryDayData.dailyKeepersRegistered + 1;
    keeperRegistryDayData.save();
}

export function handleCreatedJob(event: CreatedJob): void {
    // Update global values.
    let keeperRegistry = KeeperRegistry.load(KEEPER_REGISTRY_ADDRESS);
    keeperRegistry.txCount = keeperRegistry.txCount + 1;
    keeperRegistry.jobCount = keeperRegistry.jobCount + 1;
    keeperRegistry.save();
    
    // Create the job owner.
    let owner = JobOwner.load(event.params.owner.toHexString());
    if (owner === null)
    {
        owner = new JobOwner(event.params.owner.toHexString());
        owner.feesPaid = ZERO_BI;
    }

    owner.save();

    let job = new Job(event.params.jobID.toString());
    job.jobType = event.params.jobType;
    job.keeper = event.params.keeper.toHexString();
    job.target = event.params.target.toHexString();
    job.instanceID = event.params.instanceID;
    job.owner = event.params.owner.toHexString();
    job.numberOfUpdates = 0;
    job.availableFunds = ZERO_BI;
    job.lastUpdated = ZERO_BI;
    job.feesPaid = ZERO_BI;
    job.save();

    let keeperRegistryDayData = updateKeeperRegistryDayData(event);
    keeperRegistryDayData.dailyJobsCreated = keeperRegistryDayData.dailyJobsCreated + 1;
    keeperRegistryDayData.save();
}

export function handleUpdatedDedicatedCaller(event: UpdatedDedicatedCaller): void {
    // Update global values.
    let keeperRegistry = KeeperRegistry.load(KEEPER_REGISTRY_ADDRESS);
    keeperRegistry.txCount = keeperRegistry.txCount + 1;
    keeperRegistry.save();

    let keeper = Keeper.load(event.params.keeper.toHexString());
    keeper.dedicatedCaller = event.params.newCaller;
    keeper.save();

    updateKeeperRegistryDayData(event);
}