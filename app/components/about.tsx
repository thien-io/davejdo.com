import BlurFade from '@/components/ui/blur-fade';

export default function About() {
  return (
    <section>

      <BlurFade delay={0.2}>
        <p className='text-sm mb-4'>
          Hello! I'm David.
        </p>

      </BlurFade>
    </section>
  );
}
