# Keeper Network Subgraph

This subgraph dynamically tracks keepers and upkeeps in the [Tradegen keeper network](https://github.com/Tradegen/algo-trading/blob/main/contracts/KeeperRegistry.sol).

- aggregated data across keepers and upkeeps,
- data on individual keepers,
- data on individual upkeeps,
- historical aggregated protocol data on revenue, upkeeps created, upkeeps performed, and keepers registered
- historical aggreagted keeper data on revenue and upkeeps performed

## Running Locally

Make sure to update package.json settings to point to your own graph account.

## Queries

Below are a few ways to show how to query the [keeper-network subgraph](https://thegraph.com/hosted-service/subgraph/tradegen/keeper-network) for data. The queries show most of the information that is queryable, but there are many other filtering options that can be used, just check out the [querying api](https://thegraph.com/docs/graphql-api). These queries can be used locally or in The Graph Explorer playground.

## Key Entity Overviews

#### KeeperRegistry

Contains aggregated data across all keepers and upkeeps. This entity tracks the number of registered keepers, the number of jobs created, total revenue, total upkeeps performed, and the total transaction count.

#### Job

Contains data on a specific job. Each job is linked to a Keeper and JobOwner entity, representing the job's dedicated keeper and owner. The entity specifies the target contract's address, job type (indicator, comparator, or trading bot), and instance ID (NFT ID in indicator/comparator contract) to help monitor the health of target contracts.

#### Keeper

Contains data on a specific keeper. This entity tracks a keeper's open jobs, upkeep fee, number of upkeeps performed.

## Example Queries

### Querying Aggregated Data

This query fetches aggredated data from all keepers, to give a view into how active the network is.

```graphql
{
  keeperRegistries(first: 1) {
    keeperCount
    jobCount
    totalRevenue
    totalUpkeepsPerformed
  }
}
```
