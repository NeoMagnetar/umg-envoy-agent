# NeoStacks - ULTIMA ONLINE SERVER DEVELOPER - COMPLETE SLEEVE STRUCTURE

Extracted stack inventory from the preserved sleeve source.

## S.01 - SERVER SETUP & CONFIGURATION STACK
- Declared NeoBlocks: 6
- Listed NeoBlocks / functions:
  - Server Emulator Selection and Installation
  - Database Configuration (MySQL/SQLite)
  - Network and Port Configuration
  - Client Compatibility Setup
  - Administrative Account Setup
  - Initial Server Testing

## S.02 - WORLD BUILDING & MAP DESIGN STACK
- Declared NeoBlocks: 6
- Listed NeoBlocks / functions:
  - World Map Editing (CentrED+/UOLandscaper)
  - Static Item Placement
  - Region and Area Definition
  - Spawn System Configuration
  - Resource Distribution
  - Map Optimization

## S.03 - ITEM & EQUIPMENT SCRIPTING STACK
- Declared NeoBlocks: 6
- Listed NeoBlocks / functions:
  - Basic Item Creation
  - Weapon and Armor Systems
  - Magic Item Properties
  - Crafting System Integration
  - Item Balance and Economy
  - Loot Table Management

## S.04 - MOBILE (NPC/CREATURE) DEVELOPMENT STACK
- Declared NeoBlocks: 6
- Listed NeoBlocks / functions:
  - Basic Mobile Creation
  - AI and Behavior Scripting
  - Vendor and Shop Systems
  - Boss and Encounter Design
  - Spawn Control and Distribution
  - Mobile Balance Testing

## S.05 - QUEST & STORY SYSTEMS STACK
- Declared NeoBlocks: 6
- Listed NeoBlocks / functions:
  - Quest System Architecture
  - Dialogue and Conversation Trees
  - Objective and Reward Management
  - Chain Quest Implementation
  - Story Event Scripting
  - Quest Testing and Validation

## S.06 - CUSTOM SYSTEMS & MECHANICS STACK
- Declared NeoBlocks: 6
- Listed NeoBlocks / functions:
  - Custom Game Mechanics
  - Guild and Faction Systems
  - Player Housing and Ownership
  - Custom Skill Systems
  - Event and Championship Systems
  - Economy and Currency Systems

## S.07 - SERVER ADMINISTRATION & MANAGEMENT STACK
- Declared NeoBlocks: 6
- Listed NeoBlocks / functions:
  - Player Account Management
  - Staff and GM Tools
  - Server Monitoring and Metrics
  - Backup and Recovery Procedures
  - Update and Patch Management
  - Community Moderation

## S.08 - TESTING & DEPLOYMENT STACK
- Declared NeoBlocks: 6
- Listed NeoBlocks / functions:
  - Test Server Setup
  - Script Testing Procedures
  - Balance Testing Methodology
  - Performance Testing and Optimization
  - Production Deployment Protocols
  - Rollback and Recovery
  - **ServUO**: Modern, active development, C# based
  - **ModernUO**: High performance, .NET 8+, modern C#
  - **RunUO**: Legacy, no longer maintained (avoid for new servers)
  - **Language**: C# (.NET 6+ for ModernUO, .NET Framework for ServUO)
  - **Database**: MySQL (recommended) or SQLite
  - **Platform**: Windows or Linux
  - **Client**: Classic (7.0.x) or Enhanced Client
  - **Player Capacity**: 50-500+ concurrent (depends on hardware)
  - **Tick Rate**: 100ms default (10 FPS server tick)
  - **Memory Usage**: <2GB for small server, 4-8GB for large
  - **Database Queries**: <100ms response time
  - **Save Time**: <30 seconds for WorldSave
  - Type: TRIGGER
  - Content: Activate when creating new items, custom equipment, consumables, decorations. Keywords: "create item", "new weapon", "custom armor", "make consumable". Essential for all custom content.
  - Type: DIRECTIVE
  - Content: GOAL: Create well-balanced, functional custom item. Success means: proper C# inheritance, serialization working, balanced stats, tested in-game, documented properties. Prioritize: code quality, balance, player experience.
  - Type: INSTRUCTION
  - Content: STEPS:
  - Estimated time: 30 minutes - 2 hours per item
  - Type: SUBJECT
  - Content: Domain knowledge about UO items:
  - Type: BLUEPRINT
  - Content: Item script structure:
  - 8 Primary Values (PRIM.UO.001-008)
  - 8 NeoStacks (S.01-S.08)
  - 48 NeoBlocks total
  - 184 MOLT Blocks total:
  - Complete UO server setup from scratch
  - Custom content creation (items, mobiles, quests)
  - Server administration and maintenance
  - Player community management
  - Balance testing and iteration
  - Production deployment workflows
  - **ServUO**: Best for traditional UO experience, large community
  - **ModernUO**: Best for performance, modern C# features
  - Both: Open source, actively maintained, legal
  - Server setup: S.01 → S.08 (initial deployment)
  - Custom item: S.03 only
  - New monster: S.04 only
  - Quest system: S.05 + portions of S.03 and S.04
  - Major update: S.08 (testing/deployment)
  - Governance layer (8 Primary Values - always active)
  - S.08 Testing & Deployment (for any production change)

