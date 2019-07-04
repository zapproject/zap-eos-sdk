function logUpdate(state: any, payload: any, blockInfo: any, context: any) {
 console.info(payload)
}

export const effects = [
  {
    actionType: "zapcoretest1::bond",
    effect: logUpdate,
  },
]
