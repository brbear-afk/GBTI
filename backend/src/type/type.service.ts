import { Injectable } from '@nestjs/common';

import rawTypeProfiles from './data/types.json';
import { validateTypeProfiles } from './type-profile.validator';
import type { TypeProfile } from './type.types';

@Injectable()
export class TypeService {
  private readonly profiles = validateTypeProfiles(rawTypeProfiles as unknown);
  private readonly profilesByCode = new Map(
    this.profiles.map((profile) => [profile.code, profile]),
  );

  getProfile(code: string): TypeProfile {
    const profile = this.profilesByCode.get(code);
    if (!profile) throw new Error(`Unknown literary type: ${code}`);
    return { ...profile };
  }
}
