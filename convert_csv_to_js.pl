#!/usr/bin/perl -w

use strict;
use Data::Dumper;

my $n=0;

my @entries;
my %gismu;

my $null='';
my $pretty=0;

my @infields=qw( gismu rafsi gloss gloss2 full_def notes );
my @outfields=grep { !/gloss2/ } @infields,'xref'; # ,'entry_num';

while (<STDIN>) {
  # split based on commas, but watch out for quoted commas!
  chomp;  s/\015//; s/[&]/and/g;  s/[<]/{/g; s[>]/}/g; # get rid of bad xml characters!
  my @a=split(/["]/,$_);  # now the odd elements are the quoted ones; convert commas inside to a unique pattern:  ';;;'
  for (my $i=1; $i<scalar(@a); $i+=2) { $a[$i]=~s/,/;;;/g }
  # no re-do the split, having safely handled the quoted commas
  my @f=split(/,/,join('',@a));
  @f = map { s/;;;/,/g; $_ } @f;
  @f = map { $_ ? $_ : $null } @f;

  my %gismu_item;
  @gismu_item{@infields}=@f;
#  my ($gismu,$rafsi,$gloss,$gloss2,$full_def,$notes)=@f;
  $gismu_item{notes}=~/[(]cf.\s*(.*)[)]/ if $gismu_item{notes};
  $gismu_item{xref} = $1 // '(none)';  
  $gismu_item{xref}=~s/,//g;
  $gismu_item{notes} ||= '(none)';
  $gismu_item{gloss}.=" $gismu_item{gloss2}" unless $gismu_item{gloss2}=~/.none./;
#  $gismu_item{entry_num}=scalar(@entries);

  push @entries,$gismu_item{gismu};
  $gismu{"$gismu_item{gismu}.$_"}=$gismu_item{$_} for (@outfields);
}

$Data::Dumper::Useqq=1;   # strings in double quotes
$Data::Dumper::Indent=$pretty;  # compact output
my $entries_out=Dumper(\@entries);
$entries_out=~s/\$VAR1/entries/;

$Data::Dumper::Pair=":";
$Data::Dumper::Indent=$pretty;
my $gismu_out=Dumper(\%gismu);
$gismu_out=~s/\$VAR1/gismu/;
my $outfields_select=join('|',@outfields);
# $gismu_out=~s/["](.{4,5}\.($outfields_select))["]/$1/go;

print "function initGismu() {\n";
# print "$entries_out\n";
print "$gismu_out\n";
print "}\n";

