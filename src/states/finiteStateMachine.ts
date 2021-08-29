export abstract class State<T extends string> {

  constructor(public Name: T) { }

  Enter(fsm: FiniteStateMachine<T>, prevState?: State<T>) { };
  Exit(fsm: FiniteStateMachine<T>) { };
  Update(fsm: FiniteStateMachine<T>, timeElapsed: number) { };
}

type States<T extends string> = {
  [key in T]: State<T>;
};

export class FiniteStateMachine<Anim extends string> {

  currentState?: State<Anim>;
  constructor(private states: States<Anim>) {
  }

  SetState(name: Anim) {
    const prevState = this.currentState;

    if (prevState) {
      if (prevState.Name == name) {
        return;
      }

      prevState.Exit(this);
    }

    const state = this.states[name];

    this.currentState = state;
    state.Enter(this, prevState);
  }

  Update(timeElapsed: number) {
    if (this.currentState) {
      this.currentState.Update(this, timeElapsed);
    }
  }

};