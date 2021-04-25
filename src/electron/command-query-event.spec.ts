import { Command, Event, Query, COMMANDS_METADATA_KEY, EVENTS_METADATA_KEY, QUERIES_METADATA_KEY } from './command-query-event';

class TestClass {
  @Command('my-command-1')
  commandHandler1(): void {
    console.log('implementations');
  }

  @Command('my-command-2')
  commandHandler2(): void {
    console.log('implementations');
  }

  @Query('my-query-1')
  queryHandler1(): void {
    console.log('implementations');
  }

  @Query('my-query-2')
  queryHandler2(): void {
    console.log('implementations');
  }

  @Event('my-event-1')
  eventHandler1(): void {
    console.log('implementations');
  }

  @Event('my-event-2')
  eventHandler2(): void {
    console.log('implementations');
  }
}

describe('method decorators for communications', () => {
  describe('The @Command decorator', () => {
    it('should add metadata on which commands the class accepts', () => {
      const commandsMetadata = (Reflect.getMetadata(COMMANDS_METADATA_KEY, TestClass) || {}) as Record<string, string[]>;
      expect(commandsMetadata).toEqual({
        'my-command-1': ['commandHandler1'],
        'my-command-2': ['commandHandler2'],
      });
    });
  });
  
  describe('The @Command decorator', () => {
    it('should add metadata on which queries the class accepts', () => {
      const queriesMetadata = (Reflect.getMetadata(QUERIES_METADATA_KEY, TestClass) || {}) as Record<string, string[]>;
      expect(queriesMetadata).toEqual({
        'my-query-1': ['queryHandler1'],
        'my-query-2': ['queryHandler2'],
      });
    });
  });
  
  describe('The @Command decorator', () => {
    it('should add metadata on which commands the class accepts', () => {
      const eventsMetadata = (Reflect.getMetadata(EVENTS_METADATA_KEY, TestClass) || {}) as Record<string, string[]>;
      expect(eventsMetadata).toEqual({
        'my-event-1': ['eventHandler1'],
        'my-event-2': ['eventHandler2'],
      });
    });
  });
});
