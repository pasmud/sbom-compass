import prisma from './db';

async function seed() {
  const scan = await prisma.scan.create({
    data: {
      projectPath: '/demo/sample-project',
      status: 'completed',
      totalDeps: 42,
      criticalCount: 2,
      highCount: 5,
      mediumCount: 8,
      lowCount: 3,
      startedAt: new Date(),
      completedAt: new Date(),
    },
  });

  const deps = [
    { name: 'lodash', version: '4.17.20', ecosystem: 'npm' },
    { name: 'axios', version: '0.21.0', ecosystem: 'npm' },
    { name: 'express', version: '4.17.1', ecosystem: 'npm' },
    { name: 'minimist', version: '1.2.5', ecosystem: 'npm' },
    { name: 'node-fetch', version: '2.6.1', ecosystem: 'npm' },
    { name: 'cryptiles', version: '4.1.2', ecosystem: 'npm' },
    { name: 'djongo', version: '1.3.6', ecosystem: 'PyPI' },
    { name: 'flask', version: '1.0.0', ecosystem: 'PyPI' },
    { name: 'jinja2', version: '2.11.2', ecosystem: 'PyPI' },
    { name: 'golang-jwt', version: '4.0.0', ecosystem: 'Go' },
  ];

  const createdDeps = await Promise.all(
    deps.map((d) =>
      prisma.dependency.create({
        data: {
          scanId: scan.id,
          name: d.name,
          version: d.version,
          ecosystem: d.ecosystem,
          type: 'direct',
        },
      })
    )
  );

  const vulns = [
    { depIdx: 0, osvId: 'GHSA-4j47-8f3q-4w8w', severity: 'CRITICAL', summary: 'Prototype Pollution in lodash', cvssScore: 9.1, fixedVersion: '4.17.21', aliases: 'CVE-2020-28502' },
    { depIdx: 0, osvId: 'GHSA-29mw-wpgm-h7wr', severity: 'HIGH', summary: 'Command Injection in lodash', cvssScore: 7.2, fixedVersion: '4.17.21', aliases: 'CVE-2021-23337' },
    { depIdx: 1, osvId: 'GHSA-4w2v-v7jh-w7q5', severity: 'HIGH', summary: 'Server-Side Request Forgery in axios', cvssScore: 7.5, fixedVersion: '0.21.1', aliases: 'CVE-2020-28168' },
    { depIdx: 2, osvId: 'GHSA-r9h6-6p3r-3r5g', severity: 'MEDIUM', summary: 'Prototype Pollution in express', cvssScore: 5.6, fixedVersion: '4.17.3', aliases: 'CVE-2022-24999' },
    { depIdx: 3, osvId: 'GHSA-7pw5-42gv-7h6r', severity: 'HIGH', summary: 'Prototype Pollution in minimist', cvssScore: 7.8, fixedVersion: '1.2.6', aliases: 'CVE-2021-44906' },
    { depIdx: 4, osvId: 'GHSA-c6x8-7r3c-7w4v', severity: 'MEDIUM', summary: 'Denial of Service in node-fetch', cvssScore: 5.3, fixedVersion: '2.6.7', aliases: 'CVE-2022-0235' },
    { depIdx: 5, osvId: 'GHSA-vv3q-3p8v-5v8v', severity: 'CRITICAL', summary: 'Insufficient Entropy in cryptiles', cvssScore: 9.8, fixedVersion: '4.1.3', aliases: 'CVE-2018-1000620' },
    { depIdx: 6, osvId: 'GHSA-8c24-5h3p-5p5p', severity: 'HIGH', summary: 'MongoDB Injection in djongo', cvssScore: 8.1, fixedVersion: '1.3.7', aliases: 'CVE-2023-12345' },
    { depIdx: 7, osvId: 'GHSA-7p5p-7p3r-5v8v', severity: 'MEDIUM', summary: 'Cross-Site Scripting in flask', cvssScore: 6.1, fixedVersion: '1.1.2', aliases: 'CVE-2023-12346' },
    { depIdx: 8, osvId: 'GHSA-5p5p-8c24-7h3r', severity: 'LOW', summary: 'Information Exposure in jinja2', cvssScore: 2.5, fixedVersion: '2.11.3', aliases: 'CVE-2023-12347' },
  ];

  for (const v of vulns) {
    const created = await prisma.vulnerability.create({
      data: {
        scanId: scan.id,
        dependencyId: createdDeps[v.depIdx].id,
        osvId: v.osvId,
        severity: v.severity,
        cvssScore: v.cvssScore,
        summary: v.summary,
        fixedVersion: v.fixedVersion,
        aliases: v.aliases,
        publishedAt: new Date('2023-01-15'),
      },
    });

    await prisma.remediation.create({
      data: {
        vulnerabilityId: created.id,
        status: 'open',
      },
    });
  }

  console.log('Seed data created successfully');
  await prisma.$disconnect();
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
