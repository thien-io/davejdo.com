"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Footer } from "@/components/footer";

gsap.registerPlugin(ScrollTrigger);

const skills = [
  "Photoshop", "Premiere Pro", "Illustrator", "InDesign", "After Effects", "Final Cut Pro",
];


export default function AboutPage() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>(".about-reveal").forEach((el) => {
        gsap.fromTo(
          el,
          { y: 30, opacity: 0 },
          {
            y: 0, opacity: 1, duration: 0.7, ease: "power2.out",
            scrollTrigger: { trigger: el, start: "top 88%" },
          }
        );
      });
    }, containerRef);
    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className='min-h-screen'>
      {/* Header */}
      <section className='py-24 px-6 md:px-16 border-b border-border'>
        <div className='max-w-4xl mx-auto'>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className='text-[10px] font-mono tracking-[0.2em] uppercase text-muted-foreground mb-4'
          >
            About
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className='font-display text-7xl md:text-9xl leading-none mb-8'
          >
            HEY,
            <br />
            I&apos;M
            <br />
            <span className='text-brand-muted'>DAVE.</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className='text-lg md:text-xl text-muted-foreground max-w-2xl leading-relaxed'
          >
            Creator based in Connecticut
          </motion.p>
        </div>
      </section>

      {/* Bio */}
      <section className='py-20 px-6 md:px-16'>
        <div className='max-w-4xl mx-auto grid md:grid-cols-2 gap-16 items-start'>
          <div className='about-reveal'>
            <div className='w-full aspect-square rounded-2xl border border-border overflow-hidden relative'>
              <Image
                src="https://drive.usercontent.google.com/download?id=1isLL0gZAK7w1vSBR0Z3X3DnwB6LXrobH&export=view&authuser=0"
                alt="Dave"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
              <div className='absolute bottom-4 left-4 right-4 p-3 rounded-xl bg-background/80 backdrop-blur-sm border border-border'>
                <p className='text-xs font-mono text-muted-foreground'>
                  @davejdo
                </p>
                <p className='text-sm font-medium mt-0.5'>davejdo.com</p>
              </div>
            </div>
          </div>

          <div className='space-y-8'>
            <div className='about-reveal'>
              <h2 className='font-display text-4xl mb-4'>THE STORY</h2>
              <p className='text-muted-foreground leading-relaxed'>
                I am currently a student at the University of Connecticut,
                pursuing my passion in design and videography. In addition to my
                academic work, I am part of the team at the Mandell JCC and
                actively collaborate with nonprofit organizations, including
                Friends of Feeney.
              </p>
            </div>

            <div className='about-reveal'>
              <p className='text-muted-foreground leading-relaxed'>
                In my free time, you’ll find me in a cinema, hunting for new
                music, or with a camera somewhere This site is my corner of the
                internet a mix of work and life.
              </p>
            </div>

           
          </div>
        </div>
      </section>

      {/* Skills */}
      <section className='py-20 px-6 md:px-16 border-t border-border'>
        <div className='max-w-4xl mx-auto'>
          <div className='about-reveal mb-12'>
            <p className='text-[10px] font-mono tracking-[0.2em] uppercase text-muted-foreground mb-3'>
              Toolkit
            </p>
            <h2 className='font-display text-5xl'>SKILLS & TOOLS</h2>
          </div>
          <div className='about-reveal flex flex-wrap gap-2'>
            {skills.map((skill) => (
              <motion.span
                key={skill}
                whileHover={{ scale: 1.05, y: -2 }}
                className='px-3 py-1.5 rounded-lg border border-border text-sm text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors cursor-default bg-card'
              >
                {skill}
              </motion.span>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
