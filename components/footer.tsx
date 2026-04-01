"use client";

import { motion } from "framer-motion";
import { Mail, Twitter, Github, Instagram, Linkedin } from "lucide-react";

const contacts = [
  { label: "Email", href: "mailto:dave@davejdo.com", icon: Mail, handle: "dave@davejdo.com" },
  { label: "Twitter", href: "https://twitter.com/davejdo", icon: Twitter, handle: "@davejdo" },
  { label: "GitHub", href: "https://github.com/davejdo", icon: Github, handle: "davejdo" },
  { label: "Instagram", href: "https://instagram.com/davejdo", icon: Instagram, handle: "@davejdo" },
  { label: "LinkedIn", href: "https://linkedin.com/in/davejdo", icon: Linkedin, handle: "davejdo" },
];

export function Footer() {
  return (
    <footer className='border-t border-border mt-24 py-16 px-6 md:px-12'>
      <div className='max-w-5xl mx-auto'>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-12 mb-12'>
          {/* Left */}
          <div>
            <h3 className='font-display text-5xl mb-4'>LET&apos;S TALK</h3>
            <p className='text-muted-foreground text-sm leading-relaxed max-w-xs'>
              Whether it&apos;s a project, collaboration, or just a chat — my
              inbox is always open.
            </p>
          </div>

          {/* Right - Contacts */}
          <div className='grid grid-cols-1 gap-3'>
            {contacts.map((contact, i) => {
              const Icon = contact.icon;
              return (
                <motion.a
                  key={contact.label}
                  href={contact.href}
                  target={
                    contact.href.startsWith('mailto') ? undefined : '_blank'
                  }
                  rel='noopener noreferrer'
                  initial={{ opacity: 0, x: 10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  viewport={{ once: true }}
                  className='flex items-center gap-3 group'
                >
                  <div className='w-8 h-8 rounded-lg bg-accent flex items-center justify-center group-hover:bg-foreground transition-colors duration-200'>
                    <Icon
                      size={14}
                      className='text-muted-foreground group-hover:text-background transition-colors duration-200'
                    />
                  </div>
                  <div className='flex flex-col'>
                    <span className='text-xs text-muted-foreground font-mono tracking-wider uppercase'>
                      {contact.label}
                    </span>
                    <span className='text-sm text-foreground group-hover:text-muted-foreground transition-colors'>
                      {contact.handle}
                    </span>
                  </div>
                </motion.a>
              );
            })}
          </div>
        </div>

        {/* Bottom bar */}
        <div className='flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pt-8 border-t border-border'>
          <div className='flex items-baseline gap-1'>
            <span className='font-display text-2xl text-foreground'>DAVE</span>
            <span className='font-display text-2xl text-brand-muted'>JDO</span>
          </div>
          <p className='text-xs font-mono text-muted-foreground'>
            © {new Date().getFullYear()} davejdo.com — Built by Thien
          </p>
        </div>
      </div>
    </footer>
  );
}
