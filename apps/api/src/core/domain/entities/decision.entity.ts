import { DomainError } from '@personal-os/shared';
import { Decision as IDecision } from '@personal-os/types';

export class DecisionEntity implements IDecision {
  constructor(
    readonly id: string,
    readonly userId: string,
    public projectId: string | null,
    public title: string,
    public context: string,
    public options: string[],
    public chosenOption: string,
    public reason: string,
    public assumptions: string[] = [],
    public confidence: number = 0.8,
    public expectedOutcome: string,
    public successCriteria: string[] = [],
    readonly decisionDate: Date = new Date(),
    public reviewDate: Date | null = null,
    public actualOutcome: string | null = null,
    public evaluation: string | null = null,
    readonly createdAt: Date = new Date(),
    public updatedAt: Date = new Date()
  ) {
    if (!title || title.trim().length === 0) {
      throw new DomainError('Decision title cannot be empty', 'INVALID_DECISION_TITLE');
    }
    if (confidence < 0 || confidence > 1) {
      throw new DomainError('Confidence must be between 0.0 and 1.0', 'INVALID_CONFIDENCE');
    }
  }

  evaluateOutcome(actualOutcome: string, evaluation: string): void {
    this.actualOutcome = actualOutcome;
    this.evaluation = evaluation;
    this.updatedAt = new Date();
  }
}
