<template>
<link rel="stylesheet" href="https://unpkg.com/todomvc-app-css@2.2.0/index.css" />
  <section class="todoapp">
    <header class="header">
      <h1>todos</h1>
      <input
        class="new-todo"
        autofocus
        autocomplete="off"
        placeholder="What needs to be done?"
        v-model="newTodo"
        @keyup.enter="addTodo"
      />
    </header>
    <section class="main" v-show="shared.todos.length" v-cloak>
      <input id="toggle-all" class="toggle-all" type="checkbox" v-model="allDone" />
      <label for="toggle-all"></label>
      <ul class="todo-list">
        <li
          v-for="todo in filteredTodos"
          class="todo"
          :key="todo.id"
          :class="{ completed: todo.completed, editing: todo == editingTodo }"
        >
          <div class="view">
            <input class="toggle" type="checkbox" v-model="todo.completed" />
            <label @dblclick="editTodo(todo)">{{ todo.title }}</label>
            <button class="destroy" @click="removeTodo(todo)"></button>
          </div>
          <input
            class="edit"
            type="text"
            v-model="todo.title"
            v-todo-focus="todo == editingTodo"
            @blur="doneEdit(todo)"
            @keyup.enter="doneEdit(todo)"
            @keyup.esc="cancelEdit(todo)"
          />
        </li>
      </ul>
    </section>
    <footer class="footer" v-show="shared.todos.length" v-cloak>
      <span class="todo-count">
        <strong>{{ remaining }}</strong> {{ pluralize(remaining) }} left
      </span>
      <ul class="filters">
        <li>
          <a href="#/all" :class="{ selected: visibility == 'all' }">All</a>
        </li>
        <li>
          <a href="#/active" :class="{ selected: visibility == 'active' }">Active</a>
        </li>
        <li>
          <a href="#/completed" :class="{ selected: visibility == 'completed' }">Completed</a>
        </li>
      </ul>
      <button class="clear-completed" @click="removeCompleted" v-show="shared.todos.length > remaining">
        Clear completed
      </button>
    </footer>
  </section>
  <footer class="info">
  </footer>
</template>

<style>
[v-cloak] {
  display: none;
}
</style>

<script lang="ts">
import { defineComponent } from "vue";
import { syncedStore, getYjsValue, filterArray } from "@syncedstore/core";
import { WebrtcProvider } from "y-webrtc";
import { IndexeddbPersistence } from "y-indexeddb";
import { uuidv4 } from "lib0/random";

const urlTokens = document.URL.split('/~/');
var id : string;
if(urlTokens.length > 1 && urlTokens[1].length >0) {
  id = urlTokens[1].split('#')[0];
} else {
  id = uuidv4()
  window.history.pushState({ }, '', urlTokens[0]+'~/'+ id);
}


interface Indentified {id:string}
type Todo = { completed: boolean; title: string };
//interface User extends Indentified { name: string; createdAt: Date; icon: string }

const store = syncedStore({ todos: [] as Todo[] });

const doc = getYjsValue(store) as any;
const webrtcProvider = new WebrtcProvider(id, doc);
new IndexeddbPersistence(id, doc);

// All of our network providers implement the awareness crdt
const awareness = webrtcProvider.awareness;
console.log("clientID", awareness.clientID);

// You can observe when a user updates their awareness information
awareness.on("change", (changes: any) => {
  // Whenever somebody updates their awareness information,
  // we log all awareness information from all users.
  console.log(changes);
  const awarenesStates = Array.from(awareness.getStates().values()) as Indentified[];
  console.log(awarenesStates);
});

var myID = localStorage.getItem(id) as string;
if(!myID) {
  myID = uuidv4();
  localStorage.setItem(id,myID);
  //myself = { id:uuidv4(), name: '', createdAt: new Date(), icon: '' };
}
console.log("awareness.getLocalState", awareness.getLocalState());

// You can think of your own awareness information as a key-value store.
// We update our "user" field to propagate relevant user information.
awareness.setLocalState({id: myID});

// visibility filters
const filters = {
  all(todos: Todo[]) {
    return todos;
  },
  active(todos: Todo[]) {
    return todos.filter((todo) => !todo.completed);
  },
  completed(todos: Todo[]) {
    return todos.filter((todo) => todo.completed);
  },
};


export default defineComponent({
  data() {
    return {
      shared: store as { todos: Todo[] },
      newTodo: "",
      editingTodo: null as null | Todo,
      visibility: "all" as "all" | "active" | "completed",
      beforeEditCache: "",
    };
  },

  created(){ document.title = "Joker Poker"    },
  
  // computed properties
  // http://vuejs.org/guide/computed.html
  computed: {
    filteredTodos() {
      return filters[(this as any).visibility as "all" | "active" | "completed"]((this as any).shared.todos as Todo[]);
    },
    remaining() {
      return filters.active((this as any).shared.todos).length;
    },
    allDone: {
      get() {
        return (this as any).remaining === 0;
      },
      set(value) {
        (this.shared.todos as Todo[]).forEach((todo) => {
          todo.completed = value;
        });
      },
    },
  },

  // methods that implement data logic.
  // note there's no DOM manipulation here at all.
  methods: {
    pluralize(n: number) {
      return n === 1 ? "item" : "items";
    },
    addTodo() {
      const value = this.newTodo && this.newTodo.trim();
      if (!value) {
        return;
      }
      this.shared.todos.push({
        title: value,
        completed: false,
      });
      this.newTodo = "";
    },

    removeTodo(todo: Todo) {
      this.shared.todos.splice(this.shared.todos.indexOf(todo), 1);
    },

    editTodo(todo: Todo) {
      this.beforeEditCache = todo.title;
      this.editingTodo = todo;
    },

    doneEdit(todo: Todo) {
      if (!this.editingTodo) {
        return;
      }
      this.editingTodo = null;
      todo.title = todo.title.trim();
      if (!todo.title) {
        this.removeTodo(todo);
      }
    },

    cancelEdit(todo: Todo) {
      this.editingTodo = null;
      todo.title = this.beforeEditCache;
    },

    removeCompleted() {
      filterArray(this.shared.todos, (t) => !t.completed);
    },
  },

  // a custom directive to wait for the DOM to be updated
  // before focusing on the input field.
  // http://vuejs.org/guide/custom-directive.html
  directives: {
    "todo-focus": {
      updated(el, binding) {
        if (binding.value) {
          el.focus();
        }
      },
    },
  },
});
</script>
