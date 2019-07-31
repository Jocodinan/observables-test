import { Observable, Subject, BehaviorSubject, ReplaySubject, AsyncSubject, fromEvent, interval, from } from 'rxjs';
import { scan, throttleTime, map, multicast, refCount } from 'rxjs/operators';

class ObserverExample{
  constructor(){
    this.buttonFromEvent = document.getElementById('observer-from-event'); 
    this.buttonCreate = document.getElementById('observer-create');
    this.buttonInterval = document.getElementById('observer-interval');
    this.buttonSubject = document.getElementById('subject');
    this.buttonSubjectB = document.getElementById('subject-b');
    this.buttonBehaviorSubject = document.getElementById('behavior-subject');
    this.buttonReplaySubject = document.getElementById('replay-subject');
    this.buttonReplaySubjectB = document.getElementById('replay-subject-b');
    this.buttonAsyncSubject = document.getElementById('async-subject');
    this.buttonFromPromise = document.getElementById('from-promise');

    this.init();
  }
  init(){
    this.buttonObservableInit();

    this.buttonCreate.addEventListener('click', this.observableCreateExample);
    this.buttonInterval.addEventListener('click', this.observableIntervalExample);
    this.buttonSubject.addEventListener('click', this.subjectExample);
    this.buttonSubjectB.addEventListener('click', this.subjectExampleB);
    this.buttonBehaviorSubject.addEventListener('click', this.behaviorSubjectExample);
    this.buttonReplaySubject.addEventListener('click', this.buttonReplaySubjectExample);
    this.buttonReplaySubjectB.addEventListener('click', this.buttonReplaySubjectExampleB);
    this.buttonAsyncSubject.addEventListener('click', this.asyncSubjectExample);
    this.buttonFromPromise.addEventListener('click', this.fromPromiseExample);

  }
  buttonObservableInit(){
    const buttonClickObservable$ = fromEvent(this.buttonFromEvent, 'click');
    
    buttonClickObservable$.pipe(
      throttleTime(1000),
      map(event => event.clientX),
      scan((count, clientX) => count + clientX, 0)
    ).subscribe((count) => console.log(count));
  }
  observableCreateExample(){
    const observable$ = Observable.create((observer) => {
      observer.next(1);
      observer.next(2);
      observer.next(3);
      setTimeout(() => {
        observer.next(4);
        observer.complete();
      }, 1000);
    });

    console.log('before subscribe');

    observable$.subscribe({
      next: value => console.log(value),
      error: err => console.log(err),
      complete: () => console.log('done') 
    });

    console.log('after subscribe');
  }
  observableIntervalExample(){
    const observable1$ = interval(400),
          observable2$ = interval(300),
          subscription = observable1$.subscribe(x => console.log('primero', x)),
          childSubscription = observable2$.subscribe(x => console.log('segundo', x));
    
    subscription.add(childSubscription);
    
    setTimeout(() => {
      subscription.unsubscribe();
    }, 3000); 
  }
  subjectExample(){
    const observable$ = from([1,2,3]),
          subject = new Subject(),
          multicasted = observable$.pipe(multicast(subject));

    multicasted.subscribe({
      next: (v) => console.log('observerA: ' + v)
    });
    multicasted.subscribe({
      next: (v) => console.log('observerB: ' + v)
    });

    multicasted.connect();
  }
  subjectExampleB(){
    const observable$ = interval(500),
          subject = new Subject(),
          multicasted = observable$.pipe(multicast(subject), refCount());
    
    let subscription1, subscription2, subscriptionConnect;

    subscription1 = multicasted.subscribe({
      next: (v) => console.log('observerA: ' + v)
    });

    // subscriptionConnect = multicasted.connect();

    setTimeout(() => {
      subscription2 = multicasted.subscribe({
        next: (v) => console.log('observerB: ' + v)
      });
    }, 600);
    
    setTimeout(() => {
      subscription1.unsubscribe();
    }, 1200);

    setTimeout(() => {
      subscription2.unsubscribe();
      // subscriptionConnect.unsubscribe();
    }, 2000);

  }
  behaviorSubjectExample(){
    const subject = new BehaviorSubject(0);

    subject.subscribe({
      next: (v) => console.log('observerA: ' + v)
    });

    subject.next(1);
    subject.next(2);

    subject.subscribe({
      next: (v) => console.log('observerB: ' + v)
    });
    
    subject.next(3);
  }
  buttonReplaySubjectExample(){
    const subject = new ReplaySubject(3);

    subject.subscribe({
      next: (v) => console.log('observerA: ' + v)
    });
    
    subject.next(1);
    subject.next(2);
    subject.next(3);
    subject.next(4);
    
    subject.subscribe({
      next: (v) => console.log('observerB: ' + v)
    });
    
    subject.next(5);
  }
  buttonReplaySubjectExampleB(){
    const subject = new ReplaySubject(10, 500);

    subject.subscribe({
      next: (v) => console.log('observerA: ' + v)
    });
    
    let i = 1;
    const interval = setInterval(() => {
      subject.next(i++);
      if(i > 10)
        clearInterval(interval);
    }, 200);
    
    setTimeout(() => {
      subject.subscribe({
        next: (v) => console.log('observerB: ' + v)
      });
    }, 1000);
  }
  asyncSubjectExample(){
    const subject = new AsyncSubject();

    subject.subscribe({
      next: (v) => console.log('oberverA: '+ v)
    });

    subject.next(1);
    subject.next(2);
    subject.next(3);
    subject.next(4);

    subject.subscribe({
      next: (v) => console.log('observerB: ' + v)
    });

    subject.next(5);
    subject.complete();

  }
  fromPromiseExample(event){
    const target = event.currentTarget;
    const observable$ = Observable.create(observer => {
      target.innerHTML = 'Loading...';
      fetch('https://randomuser.me/api/')
        .then(response => response.json())
        .then(data => {
          observer.next(data);
          observer.complete();
          target.innerHTML = 'Fetch Data';
        })
        .catch(err => observer.error(err));
    });

    const subscription = observable$.subscribe(
      data => console.log(data),
      error => console.log(error)
    );
  }
}

document.addEventListener('load', new ObserverExample());