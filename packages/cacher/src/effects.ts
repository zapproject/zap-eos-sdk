function logUpdate(state: any, payload: any, blockInfo: any, context: any) {
//  console.info("State updated:\n", JSON.stringify(state, null, 2))
}

export const effects = [
  {
    actionType: "zap.main::addendpoint",
    effect: logUpdate,
  },
]
