#!/usr/bin/perl -w

use strict;

print '<?xml version="1.0" encoding="UTF-8"?>',"\n";
print "<root>\n";

my $n=0;

while (<STDIN>) {
  # split based on commas, but watch out for quoted commas!
  chomp;  s/\015//; s/[&]/and/g;  s/[<]/{/g; s[>]/}/g; # get rid of bad xml characters!
  my @a=split(/["]/,$_);  # now the odd elements are the quoted ones; convert commas inside to a unique pattern:  ';;;'
  for (my $i=1; $i<scalar(@a); $i+=2) { $a[$i]=~s/,/;;;/g }
  # no re-do the split, having safely handled the quoted commas
  my @f=split(/,/,join('',@a));
  @f = map { s/;;;/,/g; $_ } @f;
  @f = map { $_ ? $_ : '(none)' } @f;
  my ($gismu,$rafsi,$gloss,$gloss2,$full_def,$notes)=@f;
  $notes=~/[(]cf.\s*(.*)[)]/ if $notes;
  my $xref = $1 // '(none)';  $xref=~s/,//g;
  $notes ||= '(none)';
  $gloss.=" $gloss2" unless $gloss2=~/.none./;
  print "  <item>\n";
  print "    <gismu>$gismu</gismu>\n";
  print "    <rafsi>$rafsi</rafsi>\n";
  print "    <def>$full_def</def>\n";
  print "    <gloss>$gloss</gloss>\n";
  print "    <xref>$xref</xref>\n";
  print "    <notes>$notes</notes>\n";
  print "  </item>\n";

#  last if ++$n>1280;
}

print '</root>',"\n";

