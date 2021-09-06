export abstract class State<T extends string> {

  constructor(public name: T) { }

  Enter(fsm: FiniteStateMachine<T>, prevState?: State<T>) { };
  Exit(fsm: FiniteStateMachine<T>) { };
  Update(fsm: FiniteStateMachine<T>, timeElapsed: number) { };
}

type States<T extends string> = {
  [key in T]: State<T>;
};

export class FiniteStateMachine<StateNames extends string> {

  currentState?: State<StateNames>;
  constructor(private states: States<StateNames>) {
  }

  SetState(name: StateNames) {
    const prevState = this.currentState;

    if (prevState) {
      if (prevState.name == name) {
        return;
      }

      prevState.Exit(this);
    }

    const state = this.states[name];

    this.currentState = state;
    state.Enter(this, prevState);
  }

  Update(timeElapsedInSeconds: number) {
    if (this.currentState) {
      this.currentState.Update(this, timeElapsedInSeconds);
    }
  }

};