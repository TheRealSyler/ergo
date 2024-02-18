export abstract class State<T extends string> {

  constructor(public name: T) { }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  Enter(fsm: FiniteStateMachine<T>, prevState?: State<T>) { }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  Exit(fsm: FiniteStateMachine<T>, newState?: State<T>) { }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  Update(fsm: FiniteStateMachine<T>, timeElapsed: number) { }
}

type States<T extends string> = {
  [key in T]: State<T>
}

export class FiniteStateMachine<StateNames extends string> {

  currentState?: State<StateNames>
  constructor(private states: States<StateNames>) {
  }

  SetState(name: StateNames) {
    const prevState = this.currentState
    const state = this.states[name]
    if (prevState) {
      if (prevState.name == name) {
        return
      }

      prevState.Exit(this, state)
    }

    this.currentState = state
    state.Enter(this, prevState)
  }

  Update(timeElapsedInSeconds: number) {
    if (this.currentState) {
      this.currentState.Update(this, timeElapsedInSeconds)
    }
  }

}