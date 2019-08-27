import axios from 'axios';
import { Observable, Subject, BehaviorSubject, ReplaySubject, AsyncSubject, fromEvent, interval, from, timer, of } from 'rxjs';
import { fromFetch } from 'rxjs/fetch';
import { scan, throttleTime, map, multicast, refCount, catchError, tap, debounce, debounceTime, flatMap, switchMap, retry } from 'rxjs/operators';
import { ajax } from 'rxjs/ajax';

class ObserverExample{
  constructor(){
    this.searchInput = document.getElementById("search");
    this.searchList = document.getElementById("searchList");

    this.init();
  }
  init(){
    const input$ = fromEvent(this.searchInput, 'keyup').pipe(
      map( event => event.currentTarget.value ),
      debounceTime(1000),
      flatMap(value => {
        return from(
          fetch('https://api.github.com/users?per_page=5')
            .then(response => response.json())
        )
      })
    );

    input$.subscribe(
      response => console.log("response", response),
      error => console.log("error", error)
    );
  }
}

document.addEventListener('load', new ObserverExample());