import { RecommendationType, Recommendation as IRecommendation } from '@personal-os/types';

export class RecommendationEntity implements IRecommendation {
  constructor(
    readonly id: string,
    readonly userId: string,
    readonly type: RecommendationType,
    public title: string,
    public description: string,
    public reason: string,
    public evidence: string[] = [],
    public confidence: number = 0.8,
    public impact: 'LOW' | 'MEDIUM' | 'HIGH' = 'MEDIUM',
    public urgency: 'LOW' | 'MEDIUM' | 'HIGH' = 'MEDIUM',
    public suggestedAction: Record<string, unknown> | null = null,
    public requiresConfirmation: boolean = true,
    public isApplied: boolean = false,
    readonly createdAt: Date = new Date()
  ) {}

  apply(): void {
    this.isApplied = true;
  }
}
