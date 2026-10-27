"use client";

import { useEffect, useRef, useState } from "react";
import type { UserProfile } from "@/lib/types";
import { createEmptyProfile } from "@/lib/engines/profile-validation";
import { loadProfileDraft, saveProfileDraft, RESET_EVENT } from "@/lib/storage";
import { StepProgress } from "@/components/ui/StepProgress";
import { ConsentStep } from "@/components/onboarding/ConsentStep";
import { IdentityStep } from "@/components/onboarding/IdentityStep";
import { DemographicsStep } from "@/components/onboarding/DemographicsStep";
import { SocialStep } from "@/components/onboarding/SocialStep";
import { LifestyleStep } from "@/components/onboarding/LifestyleStep";
import { PersonalityStep } from "@/components/onboarding/PersonalityStep";
import { FaceScanStep } from "@/components/onboarding/FaceScanStep";
import { ProfileProgressBar } from "@/components/onboarding/ProfileProgressBar";
import { MIN_PHOTOS } from "@/lib/data/form-options";

import type { OnboardingMode } from "@/lib/data/personality-questions";

const STEPS = ["Onay", "Kimlik", "Profil", "Sosyal", "Yaşam", "Kişilik", "Yüz"];

interface OnboardingWizardProps {
  onComplete: (profile: UserProfile) => void;
  initialProfile?: Partial<UserProfile>;
  mode?: OnboardingMode;
}

export function OnboardingWizard({ onComplete, initialProfile, mode = "standard" }: OnboardingWizardProps) {
  const [step, setStep] = useState(0);
  const [profile, setProfile] = useState<Partial<UserProfile>>(() => ({
    ...createEmptyProfile(),
    ...initialProfile,
  }));
  const [draftLoaded, setDraftLoaded] = useState(false);
  const [resetVersion, setResetVersion] = useState(0);
  const [skipDraft, setSkipDraft] = useState(false);
  const wizardRef = useRef<HTMLDivElement>(null);
  const shownStep = useRef(step);

  // Keep the step's start in view after Geri/Devam, instead of letting the
  // browser clamp the old scroll position (which can jump to the page top).
  useEffect(() => {
    if (shownStep.current === step) return;
    shownStep.current = step;
    wizardRef.current?.scrollIntoView({ block: "start" });
  }, [step]);

  useEffect(() => {
    const onReset = () => {
      setSkipDraft(true);
      setProfile({ ...createEmptyProfile(), ...initialProfile });
      setStep(0);
      setResetVersion((v) => v + 1);
    };
    window.addEventListener(RESET_EVENT, onReset);
    return () => window.removeEventListener(RESET_EVENT, onReset);
  }, [initialProfile]);

  useEffect(() => {
    loadProfileDraft().then((draft) => {
      if (draft && !initialProfile) {
        setProfile((p) => ({ ...p, ...draft }));
      }
      setDraftLoaded(true);
    });
  }, [initialProfile, resetVersion]);

  useEffect(() => {
    if (!draftLoaded || skipDraft) return;
    const timer = setTimeout(() => {
      saveProfileDraft(profile).catch(() => {});
    }, 600);
    return () => clearTimeout(timer);
  }, [profile, draftLoaded, skipDraft]);

  const update = (patch: Partial<UserProfile>) => {
    setProfile((prev) => ({ ...prev, ...patch }));
  };

  const next = () => setStep((s) => Math.min(s + 1, STEPS.length - 1));
  const back = () => setStep((s) => Math.max(s - 1, 0));

  const finish = () => {
    onComplete({
      ...(profile as UserProfile),
      createdAt: new Date().toISOString(),
    });
  };

  return (
    <div ref={wizardRef} className="animate-fade-in">
      <ProfileProgressBar
        step={step}
        totalSteps={STEPS.length}
        photos={
          step >= 6
            ? {
                current: profile.photos?.filter((p) => p.faceScan?.faceDetected).length ?? 0,
                required: MIN_PHOTOS,
              }
            : undefined
        }
      />
      <StepProgress steps={STEPS} current={step} />

      {step === 0 && <ConsentStep profile={profile} onChange={update} onNext={next} />}
      {step === 1 && <IdentityStep profile={profile} onChange={update} onNext={next} />}
      {step === 2 && (
        <DemographicsStep profile={profile} onChange={update} onNext={next} onBack={back} />
      )}
      {step === 3 && (
        <SocialStep profile={profile} onChange={update} onNext={next} onBack={back} />
      )}
      {step === 4 && (
        <LifestyleStep profile={profile} onChange={update} onNext={next} onBack={back} />
      )}
      {step === 5 && (
        <PersonalityStep profile={profile} onChange={update} onNext={next} onBack={back} mode={mode} />
      )}
      {step === 6 && (
        <FaceScanStep profile={profile} onChange={update} onFinish={finish} onBack={back} />
      )}
    </div>
  );
}
