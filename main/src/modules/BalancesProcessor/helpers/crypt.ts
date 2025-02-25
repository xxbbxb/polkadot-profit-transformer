import * as scale from 'scale-codec'

export interface AccountBalance {
  nonce: number;
  consumers: number;
  providers: number;
  sufficients: number;
  data: {
    free: bigint;
    reserved: bigint;
    miscFrozen: bigint;
    feeFrozen: bigint;
  }
}

export const decodeAccountBalanceValue = (value: string): AccountBalance => {

  if (value === '00') {
    return {
      nonce: 0,
      consumers: 0,
      providers: 0,
      sufficients: 0,
      data: {
        free: BigInt(0),
        reserved: BigInt(0),
        miscFrozen: BigInt(0),
        feeFrozen: BigInt(0)
      }
    }
  }


  const ScaleAccountBalance = ((): any => {
    switch (value.length) {

      case 140:
        //Balance 1{ "nonce": 0, "refcount": 0, "data": { "free": "0x00000000000000000014cea15e380800", "reserved": 0, "miscFrozen": 0, "feeFrozen": 0 } }
        //0100000000000008385ea1ce14000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
        //01020000000000000080d37886020000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
        return scale.object(
          scale.field('nonce', scale.u32),
          scale.field('refcount', scale.u8),
          scale.field('data',
            scale.object(
              scale.field('free', scale.u128),
              scale.field('reserved', scale.u128),
              scale.field('miscFrozen', scale.u128),
              scale.field('feeFrozen', scale.u128)
            )
          ),
        )

      case 146:
        //polkadot block 2005678
        //01020000000000000080d37886020000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
        //0x020000000000000000f94a7d020000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
        //{nonce: 2, refcount: 0, data: {free: 10692000000, reserved: 0, miscFrozen: 0, feeFrozen: 0}}
        return scale.object(
          scale.field('refcount2', scale.u8), //maybe not correct.
          scale.field('nonce', scale.u32),
          scale.field('refcount', scale.u16),
          scale.field('refcount3', scale.u16),

          scale.field('data',
            scale.object(
              scale.field('free', scale.u128),
              scale.field('reserved', scale.u128),
              scale.field('miscFrozen', scale.u128),
              scale.field('feeFrozen', scale.u128)
            )
          ),
        )

      case 152:
        //polkadot
        //"block_id":"4120373","block_hash":"0x6a6b36a26bff56544e00af0c29ad77c5dfc20e8bbe5763ca80cfa21e37dd9451"
        //26aa394eea5630e07c48ae0c9558cef7b99d880ec681799c0cf30e8886371da9 12YunyNQq8WhDYUbcBW4qK6sa1XTPSuG8yd6nPRGqbW6t7kz
        //26aa394eea5630e07c48ae0c9558cef7b99d880ec681799c0cf30e8886371da9 fce1bcf451d386328a149b768eb48ebf44928e896b1c891f12aa15b6ff2132e8b7d9e97dadcf15e6e20724b8d17fe73e
        //26aa394eea5630e07c48ae0c9558cef7b99d880ec681799c0cf30e8886371da9 56dc20413f5d004459dd4d0648114dd59678195132e101ab4227585a6b64b893

        //03000000000000000100000000a2e99b550000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000

        //0300000000000000010000000003df51300000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
        //Balance 1 {"nonce":3,"consumers":0,"providers":1,"data":{"free":207532000000,"reserved":0,"miscFrozen":0,"feeFrozen":0}}

        return scale.object(
          scale.field('nonce', scale.u32),
          scale.field('consumers', scale.u32),
          scale.field('providers', scale.u32),
          scale.field('data',
            scale.object(
              scale.field('free', scale.u128),
              scale.field('reserved', scale.u128),
              scale.field('miscFrozen', scale.u128),
              scale.field('feeFrozen', scale.u128)
            )
          ),
        )

      case 154:
        //010300000000000000010000000003df51300000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
        //Balance 1 {"nonce":3,"consumers":0,"providers":1,"data":{"free":207532000000,"reserved":0,"miscFrozen":0,"feeFrozen":0}}
        return scale.object(
          scale.field('refcount2', scale.u8),
          scale.field('nonce', scale.u32),
          scale.field('consumers', scale.u32),
          scale.field('providers', scale.u32),
          scale.field('data',
            scale.object(
              scale.field('free', scale.u128),
              scale.field('reserved', scale.u128),
              scale.field('miscFrozen', scale.u128),
              scale.field('feeFrozen', scale.u128)
            )
          ),
        )

      case 160:
        //00000000000000000100000000000000eaac1adc53b417060000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
        return scale.object(
          scale.field('nonce', scale.u32),
          scale.field('consumers', scale.u32),
          scale.field('providers', scale.u32),
          scale.field('sufficients', scale.u32),
          scale.field('data',
            scale.object(
              scale.field('free', scale.u128),
              scale.field('reserved', scale.u128),
              scale.field('miscFrozen', scale.u128),
              scale.field('feeFrozen', scale.u128)
            )
          ),
        )
      case 162:
        //kusama: 17000137
        //01160e000000000000010000000000000003a8d752fe1400000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
        //01000000000000000001000000000000000392c9ee4fe7d700000000000000000000c0d9bd16c8000000000000000000000000000000000000000000000000000000000000000000000000000000000000
        //0163000000000000000100000000000000cbeae28593f1382900000000000000000000f4224c06e3d730000000000000000000000000000000000000000000000000000000000000000000000000000000
        //moonbeam: 574323
        //account id - 0xe6584f948e5C9c1BDABf84dC5AF75b94019393f1
        //0x64000000000000000100000000000000cbba91e41f5e3f2900000000000000000000f4224c06e3d730000000000000000000000000000000000000000000000000000000000000000000000000000000
        return scale.object(
          scale.field('refcount2', scale.u8),
          scale.field('nonce', scale.u32),
          scale.field('consumers', scale.u32),
          scale.field('providers', scale.u32),
          scale.field('sufficients', scale.u32),
          scale.field('data',
            scale.object(
              scale.field('free', scale.u128),
              scale.field('reserved', scale.u128),
              scale.field('miscFrozen', scale.u128),
              scale.field('feeFrozen', scale.u128)
            )
          ),
        )

      default:
        throw new Error(`Unknown ScaleAccountBalance. Value is: ${value}. Value length: ${value.length}`)
    }
  })()

  //console.log("==============")
  const encodedBytes = new Uint8Array(Buffer.from(value, 'hex'))
  //console.log(encodedBytes)
  //console.log("++++++++++++++")
  //console.log(ScaleAccountBalance)
  return ScaleAccountBalance.decode(encodedBytes)
}
