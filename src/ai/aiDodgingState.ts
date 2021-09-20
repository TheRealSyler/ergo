import { AttackStance, CharacterController } from '../character/characterController';
import { Input } from '../playerInput';
import { FiniteStateMachine, State } from '../finiteStateMachine';
import { DodgeAnimations } from '../animation/types';
import { checkChance, chooseRandomArrayEl } from '../utils';
import { AiStates, DODGE_POSSIBILITIES } from './aiCharacterInput';

export class AiDodgingState extends State<AiStates> {
  constructor(private playerChar: CharacterController, private keysRef: Input['keys']) {
    super('ai_dodging');
  }
  private direction: DodgeAnimations = 'dodge_left';
  private successfullyDodged = false;
  Enter() {
    const dodge = DODGE_POSSIBILITIES[(this.playerChar.stance as AttackStance).attackDirection];
    this.direction = Array.isArray(dodge) ? chooseRandomArrayEl(dodge) : dodge;
    this.successfullyDodged = checkChance(this.playerChar.stats.aiDodgeChance);
  }

  Update(fsm: FiniteStateMachine<AiStates>) {
    if (this.successfullyDodged) {
      this.successfullyDodged = false;
      this.keysRef[this.direction] = true;

    } else if (this.playerChar.stance.type !== 'attack') {
      this.keysRef[this.direction] = false;
      fsm.SetState('ai_idle');
    }
  }
}
