import { CharacterController } from './characterController';
import { Input } from './characterControllerInput';
import { FiniteStateMachine, State } from './states/finiteStateMachine';
import { AttackAnimations, DodgeAnimations } from './states/types';
import { chooseRandomArrayEl, error } from './utils';

type AiStates = 'idle' | 'dodging' | 'attacking';

const DodgePossibilities: { [key in AttackAnimations]: DodgeAnimations | DodgeAnimations[] } = {
  attack_down: ['dodge_left', 'dodge_right'],
  attack_right: 'dodge_right',
  attack_left: 'dodge_left',
  attack_up: ['dodge_right', 'dodge_left']
}

class AiIdleState extends State<AiStates> {
  private timeToAttack = -1;

  constructor(private playerChar: CharacterController) {
    super('idle')
  }
  Enter() {
    this.timeToAttack = 1 + (Math.random() * 1.5)
  }
  Update(fsm: FiniteStateMachine<AiStates>, timeElapsed: number) {
    switch (this.playerChar.stance.type) {
      case 'idle':
        if (this.timeToAttack > 0) {

          this.timeToAttack -= timeElapsed;

          if (this.timeToAttack < 0) {
            fsm.SetState('attacking')
          }
        }
        return;
      case 'attack':
        fsm.SetState('dodging')
        return;
    }
  }
}
class AiDodgingState extends State<AiStates> {
  constructor(private playerChar: CharacterController, private keysRef: Input['keys']) {
    super('dodging')
  }
  private direction: DodgeAnimations = 'dodge_left'
  private timeToDodge = -1
  Enter() {
    if (this.playerChar.stance.type === 'attack') {
      const dodge = DodgePossibilities[this.playerChar.stance.attackDirection];
      this.direction = Array.isArray(dodge) ? chooseRandomArrayEl(dodge) : dodge
      this.timeToDodge = 0.1 + (Math.random() * 0.2)
    } else {
      error('THIS SHOULD NOT HAPPEN', 'AiDodgingState')
    }
  }

  Update(fsm: FiniteStateMachine<AiStates>, timeElapsedInSeconds: number) {
    if (this.timeToDodge > 0) {

      this.timeToDodge -= timeElapsedInSeconds;

      if (this.timeToDodge < 0) {
        this.keysRef[this.direction] = true
      }
    } else if (this.playerChar.stance.type !== 'attack') {
      this.keysRef[this.direction] = false
      fsm.SetState('idle')
    }
  }

}
class AiAttackingState extends State<AiStates> {
  constructor(private selfRef: CharacterController, private keysRef: Input['keys']) {
    super('attacking')
  }
  private direction?: AttackAnimations;
  Enter() {

    this.direction = chooseRandomArrayEl(['attack_down', 'attack_left', 'attack_right', 'attack_up'] as AttackAnimations[]);
    this.keysRef[this.direction] = true;
  }
  Update(fsm: FiniteStateMachine<AiStates>) {
    if (this.direction) {
      this.keysRef[this.direction] = false;
      this.direction = undefined;
    }
    if (this.selfRef.stateMachine.currentState?.name === 'idle') {
      fsm.SetState('idle')
    }
  }

}

export class AiCharacterControllerInput implements Input {
  keys = {
    attack_right: false,
    attack_left: false,
    attack_up: false,
    attack_down: false,
    dodge_left: false,
    dodge_right: false
  };

  private aiStateMachine: FiniteStateMachine<AiStates> = new FiniteStateMachine<AiStates>({
    attacking: new AiAttackingState(this.selfRef, this.keys),
    dodging: new AiDodgingState(this.playerChar, this.keys),
    idle: new AiIdleState(this.playerChar)
  })

  constructor(private selfRef: CharacterController, private playerChar: CharacterController) {
    this.aiStateMachine.SetState('idle')
  }

  Update(elapsedTimeInSeconds: number) {
    this.aiStateMachine.Update(elapsedTimeInSeconds)
  }
};